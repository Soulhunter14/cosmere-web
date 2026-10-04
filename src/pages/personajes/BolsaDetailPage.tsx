import { useState, useEffect, useRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode, type Ref } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Minus, Trash2, Info, Sword, Shield, ShieldCheck, Package, ShoppingBag, Star, TriangleAlert, type LucideIcon } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { catalogApi } from '../../api/catalog'
import { Button, Card, ConfirmDialog, IconButton, SectionTitle, Sheet, Spinner, Stepper } from '../../components/ui'
import type { Character, UpdateCharacterRequest, WeaponCatalog, ArmorCatalog, GearItem, CatalogOption } from '../../types'
import { CharacterIdentityPills } from '../../components/CharacterIdentityPills'
import { CharacterHero } from '../../components/CharacterHero'
import { CosmereIcon } from '../../components/CosmereIcon'
import { heroPill, onGem, onGemSoft } from '../../lib/hero'
import { cosmereImage } from '../../lib/cosmereAssets'
import { buttonReset, c, eyebrow, font, fs, numeral, pill, radius, tint, titleText, tone, type Tone } from '../../theme'

type ItemKind = 'weapon' | 'armor' | 'gear'

/* Category identity, shared with the catalog: Armas = rubí · Armaduras = circón · Equipo = amatista */
const CATEGORY: Record<ItemKind, { tone: Tone; Icon: LucideIcon }> = {
  weapon: { tone: tone.rubi, Icon: Sword },
  armor: { tone: tone.circon, Icon: Shield },
  gear: { tone: tone.amatista, Icon: Package },
}

/* Full-bleed hero on phones, rounded card from 640px (same trick as the other character detail pages) */
const fromTablet = (px: number) => `clamp(0px, calc((100vw - 640px) * 999), ${px}px)`

/* Official sphere illustrations */
const IMG_MARCO = cosmereImage('esfera-marco-diamante')
const IMG_CHIP = cosmereImage('esfera-chip-zafiro')

/* ─── Local primitives ─────────────────────────────────────────────────── */

/** Tinted pill button in a gem tone (Añadir / Gastar / Añadir por categoría).
 *  Hover mirrors the shared danger button: 20% tint, 50% outline. */
function ToneButton({ t, icon, children, style, ref, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { t: Tone; icon?: ReactNode; ref?: Ref<HTMLButtonElement> }) {
  const [hover, setHover] = useState(false)
  const lit = hover && !props.disabled
  return (
    <button
      ref={ref}
      type="button"
      className="ui-btn"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHover(true) }}
      onPointerLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        minHeight: 36,
        padding: '0 14px',
        borderRadius: radius.full,
        background: lit ? tint(t.fg, 20) : t.bg,
        border: `1px solid ${lit ? tint(t.fg, 50) : t.border}`,
        color: t.fg,
        fontSize: fs.sm,
        fontWeight: 650,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        ...style,
      }}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}

/** Sub-section of the item detail sheet (h3 under the sheet's h2) */
function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 style={{ ...eyebrow, fontFamily: font.ui, marginBottom: 8 }}>{title}</h3>
      {children}
    </section>
  )
}

/** Label/value tile inside a <dl> */
function StatPill({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 12px', borderRadius: radius.sm, background: c.s2, border: `1px solid ${c.border}`, minWidth: 0 }}>
      <dt style={eyebrow}>{label}</dt>
      <dd style={{ fontSize: fs.sm + 1, fontWeight: 650, color: c.text, overflowWrap: 'anywhere' }}>{value}</dd>
    </div>
  )
}

function TraitRow({ name, description, expert = false }: { name: ReactNode; description?: string | null; expert?: boolean }) {
  const t = expert ? tone.topacio : null
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 12px',
        borderRadius: radius.sm,
        background: t ? t.bg : c.s2,
        border: `1px solid ${t ? t.border : c.border}`,
      }}
    >
      {t ? (
        <Star size={14} aria-hidden style={{ color: t.fg, fill: 'currentColor', marginTop: 3 }} />
      ) : (
        <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: c.subtle, marginTop: 8, flexShrink: 0 }} />
      )}
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: fs.sm + 1, fontWeight: 650, color: t ? t.fg : c.text }}>
          {expert && <span className="sr-only">Rasgo experto: </span>}
          {name}
        </p>
        {description && <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45, marginTop: 2 }}>{description}</p>}
      </div>
    </li>
  )
}

function SphereImg({ src, size, style }: { src?: string; size: number; style?: CSSProperties }) {
  if (!src) return null
  return <img src={src} alt="" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, ...style }} />
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

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
  // Focus targets after removing an item (see keepFocusAfterRemoval)
  const addButtons = useRef<Partial<Record<ItemKind, HTMLButtonElement | null>>>({})
  const itemLists = useRef<Partial<Record<ItemKind, HTMLUListElement | null>>>({})
  // Focus target after spending every Marco ("Gastar" becomes disabled and cannot take focus back)
  const addMarcosButton = useRef<HTMLButtonElement>(null)

  const { data: character, isLoading } = useQuery<Character>({
    queryKey: ['character', cId, charId],
    queryFn: () => charactersApi.getById(cId, charId),
  })

  useEffect(() => {
    // Optimistic local copy, re-synced from the server on every refetch (pre-existing behaviour, kept as is)
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  // Same thresholds as before: ≥100% rubí (sobrecarga) · ≥75% topacio (aviso) · otherwise esmeralda
  const barTone = weightPct >= 1 ? tone.rubi : weightPct >= 0.75 ? tone.topacio : tone.esmeralda
  const weightLabel = Number.isInteger(currentWeight) ? `${currentWeight}` : currentWeight.toFixed(1)
  const capLabel = Number.isInteger(capacity) ? `${capacity}` : capacity.toFixed(1)

  const pending = marcosMutation.isPending
  const canSpendInfusa = !(marcos.infusas === 0 || pending)
  const canRecharge = !(marcos.opacas === 0 || pending)

  const confirmMarcos = () => {
    if (marcosDialog === 'add') {
      applyMarcos(marcos.infusas + marcosDelta, marcos.opacas)
    } else {
      const toRemove = Math.min(marcosDelta, marcosTotal)
      const newOpacas = Math.max(0, marcos.opacas - toRemove)
      const removed = marcos.opacas - newOpacas
      const newInfusas = Math.max(0, marcos.infusas - (toRemove - removed))
      applyMarcos(newInfusas, newOpacas)
      // Spending everything disables "Gastar", so the dialog's focus restore would fall to <body>
      if (toRemove >= marcosTotal) window.setTimeout(() => addMarcosButton.current?.focus(), 0)
    }
    setMarcosDialog(null)
  }

  // Rows are keyed by index: after a removal every row but the last stays mounted, and the dialog's focus
  // restore lands on the Trash button that now shows the next item. When the LAST row is removed, its button
  // unmounts on refetch and focus would fall to <body>, so move it to the row above, or to the section's
  // "Añadir" button when the list becomes empty.
  const keepFocusAfterRemoval = (type: ItemKind, index: number, count: number) => {
    if (index < count - 1) return
    window.setTimeout(() => {
      const rowAbove = index > 0 ? itemLists.current[type]?.querySelectorAll<HTMLButtonElement>('[data-remove]')[index - 1] : undefined
      ;(rowAbove ?? addButtons.current[type])?.focus()
    }, 0)
  }

  // The Infusas ± steppers use aria-disabled (not `disabled`): they are unavailable while the mutation is
  // pending, and a natively disabled button drops keyboard focus to <body> after every press.
  // Pointer events are off in that state so the mouse behaves exactly as with `disabled`.
  const roundStep = (enabled: boolean): CSSProperties => ({
    borderRadius: '50%',
    background: tone.brand.bg,
    border: `1px solid ${tone.brand.border}`,
    color: tone.brand.fg,
    fontSize: fs.lg,
    fontWeight: 700,
    opacity: enabled ? 1 : 0.4,
    pointerEvents: enabled ? undefined : 'none',
  })

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* ─── Hero ─── */}
      <CharacterHero
        characterId={character.id}
        padding="24px 20px 22px"
        style={{ borderRadius: fromTablet(radius.lg), marginTop: fromTablet(16), borderBottom: 'none' }}
      >
        <p style={{ ...eyebrow, color: onGemSoft, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <ShoppingBag size={14} aria-hidden />
          Bolsa
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ ...titleText, fontSize: fs['2xl'], color: onGem, overflowWrap: 'anywhere' }}>{character.name}</h1>
          <span style={heroPill}>Nv. {character.level}</span>
        </div>
        <CharacterIdentityPills character={character} variant="hero" style={{ marginTop: 12 }} />
      </CharacterHero>

      <div style={{ padding: '24px 16px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* ─── Marcos ─── */}
        <section aria-labelledby="bolsa-marcos">
          <SectionTitle
            id="bolsa-marcos"
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <ToneButton
                  ref={addMarcosButton}
                  t={tone.esmeralda}
                  icon={<Plus size={15} aria-hidden />}
                  aria-label="Añadir Marcos"
                  aria-haspopup="dialog"
                  onClick={() => { setMarcosDelta(1); setMarcosDialog('add') }}
                >
                  Añadir
                </ToneButton>
                <ToneButton
                  t={tone.rubi}
                  icon={<Minus size={15} aria-hidden />}
                  aria-label="Gastar Marcos"
                  aria-haspopup="dialog"
                  onClick={() => { setMarcosDelta(1); setMarcosDialog('remove') }}
                  disabled={marcosTotal === 0}
                  style={{ cursor: marcosTotal === 0 ? 'not-allowed' : 'pointer' }}
                >
                  Gastar
                </ToneButton>
              </div>
            }
          >
            Marcos
          </SectionTitle>
          <Card padding={0} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: `1px solid ${c.border}` }}>
              <SphereImg src={IMG_MARCO} size={40} />
              <p style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ ...numeral, fontSize: fs['2xl'], color: c.text }}>{marcosTotal}</span>
                <span style={{ fontSize: fs.sm, color: c.muted }}>total</span>
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {/* Infusas: hold Stormlight */}
              <div style={{ ...marcoColumn, borderRight: `1px solid ${c.border}` }}>
                <p style={{ ...eyebrow, color: tone.brand.fg, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <SphereImg src={IMG_CHIP} size={20} style={{ filter: 'drop-shadow(0 0 5px var(--brand-glow))' }} />
                  Infusas
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <IconButton
                    label="Apagar un Marco infuso"
                    size={44}
                    onClick={() => { if (canSpendInfusa) applyMarcos(marcos.infusas - 1, marcos.opacas + 1) }}
                    aria-disabled={!canSpendInfusa || undefined}
                    aria-busy={pending || undefined}
                    style={roundStep(canSpendInfusa)}
                  >
                    {pending ? '…' : <Minus size={18} aria-hidden />}
                  </IconButton>
                  <span style={{ ...numeral, fontSize: fs['2xl'], color: c.brandLight, minWidth: 36, textAlign: 'center' }}>{marcos.infusas}</span>
                  <IconButton
                    label="Recargar un Marco opaco"
                    size={44}
                    onClick={() => { if (canRecharge) applyMarcos(marcos.infusas + 1, marcos.opacas - 1) }}
                    aria-disabled={!canRecharge || undefined}
                    aria-busy={pending || undefined}
                    style={roundStep(canRecharge)}
                  >
                    {pending ? '…' : <Plus size={18} aria-hidden />}
                  </IconButton>
                </div>
                <p style={marcoCaption}>brillantes</p>
              </div>

              {/* Opacas: dun spheres */}
              <div style={marcoColumn}>
                <p style={{ ...eyebrow, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <SphereImg src={IMG_CHIP} size={20} style={{ filter: 'grayscale(1)', opacity: 0.6 }} />
                  Opacas
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 44 }}>
                  <span style={{ ...numeral, fontSize: fs['2xl'], color: c.muted, minWidth: 36, textAlign: 'center' }}>{marcos.opacas}</span>
                </div>
                <p style={marcoCaption}>apagadas</p>
              </div>
            </div>

            <p className="sr-only" aria-live="polite">
              {`${marcosTotal} Marcos en total: ${marcos.infusas} infusas y ${marcos.opacas} opacas`}
            </p>

            {marcosTotal > 0 && (
              <p style={{ padding: '10px 16px 12px', borderTop: `1px solid ${c.border}`, fontSize: fs.xs, color: c.muted, textAlign: 'center' }}>
                Usa +/− en Infusas para cambiar el estado de un Marco
              </p>
            )}
          </Card>
        </section>

        {/* ─── Capacidad de carga ─── */}
        <section aria-labelledby="bolsa-carga">
          <SectionTitle
            id="bolsa-carga"
            action={
              <span style={{ fontSize: fs.sm, color: c.muted, whiteSpace: 'nowrap' }}>
                Fuerza <strong style={{ ...numeral, fontSize: fs.base, color: c.text }}>{character.fuerza ?? 0}</strong>
              </span>
            }
          >
            Capacidad de carga
          </SectionTitle>
          <Card padding="16px 16px 18px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <p style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ ...numeral, fontSize: fs['2xl'], color: barTone.fg }}>{weightLabel}</span>
                <span style={{ fontSize: fs.sm, color: c.muted }}>/ {capLabel} kg</span>
              </p>
              {weightPct >= 1 ? (
                <span style={pill(tone.rubi)}>
                  <TriangleAlert size={13} aria-hidden />
                  ¡Sobrecargado!
                </span>
              ) : weightPct >= 0.75 ? (
                <span style={pill(tone.topacio)}>
                  <TriangleAlert size={13} aria-hidden />
                  Cerca del límite
                </span>
              ) : null}
            </div>
            <div
              role="progressbar"
              aria-label="Capacidad de carga"
              aria-valuemin={0}
              aria-valuemax={capacity}
              aria-valuenow={Math.min(currentWeight, capacity)}
              aria-valuetext={`${weightLabel} de ${capLabel} kg`}
              style={{ height: 8, borderRadius: radius.full, background: c.track, overflow: 'hidden' }}
            >
              <div style={{ height: '100%', width: `${weightPct * 100}%`, borderRadius: radius.full, background: barTone.fg, transition: 'width 0.3s, background 0.3s' }} />
            </div>
          </Card>
        </section>

        {/* ─── Armas / Armaduras / Equipo ─── */}
        {([
          { type: 'weapon' as const, label: 'Armas',     items: character.weapons ?? [] },
          { type: 'armor'  as const, label: 'Armaduras', items: character.armor ?? [] },
          { type: 'gear'   as const, label: 'Equipo',    items: character.equipment ?? [] },
        ] as const).map(({ type, label, items }) => {
          const cat = CATEGORY[type]
          const CatIcon = cat.Icon
          return (
            <section key={type} aria-labelledby={`bolsa-${type}`}>
              <SectionTitle
                id={`bolsa-${type}`}
                action={
                  <ToneButton
                    ref={(el) => { addButtons.current[type] = el }}
                    t={cat.tone}
                    icon={<Plus size={15} aria-hidden />}
                    aria-label={`Añadir ${label}`}
                    aria-haspopup="dialog"
                    onClick={() => setItemPicker(type)}
                  >
                    Añadir
                  </ToneButton>
                }
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <CatIcon size={17} aria-hidden style={{ color: cat.tone.fg }} />
                  {label}
                </span>
              </SectionTitle>

              <Card padding={0} style={{ overflow: 'hidden' }}>
                {items.length > 0 ? (
                  <ul role="list" ref={(el) => { itemLists.current[type] = el }} style={{ listStyle: 'none' }}>
                    {items.map((name, idx) => {
                      const equippedIndex = type === 'armor' ? items.findIndex((n) => n === character.equippedArmor) : -1
                      const isEquipped = type === 'armor' && idx === equippedIndex
                      return (
                        <li
                          key={idx}
                          className="rise"
                          style={{
                            '--i': idx,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            minHeight: 56,
                            padding: '8px 8px 8px 16px',
                            borderTop: idx > 0 ? `1px solid ${c.border}` : 'none',
                            background: isEquipped ? tint('var(--topacio)', 7) : 'transparent',
                            boxShadow: isEquipped ? 'inset 3px 0 0 var(--topacio)' : undefined,
                          } as CSSProperties}
                        >
                          <span style={{ flex: 1, minWidth: 0, fontSize: fs.base, fontWeight: 550, color: c.text, overflowWrap: 'anywhere', lineHeight: 1.35 }}>{name}</span>
                          <IconButton label={`Ver detalles de ${name}`} size={40} aria-haspopup="dialog" onClick={() => setBolsaDetail({ kind: type, name })}>
                            <Info size={18} aria-hidden />
                          </IconButton>
                          {type === 'armor' && (
                            <button
                              type="button"
                              className="ui-btn"
                              aria-pressed={isEquipped}
                              onClick={() => {
                                const armorData = catalogArmor.find((a) => a.name === name)
                                desvioMutation.mutate(isEquipped ? { equippedArmor: '', desvio: 0 } : { equippedArmor: name, desvio: armorData?.desvio ?? 0 })
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                minHeight: 36,
                                padding: '0 12px',
                                borderRadius: radius.full,
                                border: `1px solid ${isEquipped ? tone.topacio.border : c.borderBright}`,
                                background: isEquipped ? tone.topacio.bg : c.s2,
                                color: isEquipped ? tone.topacio.fg : c.muted,
                                fontSize: fs.sm,
                                fontWeight: 650,
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                flexShrink: 0,
                              }}
                            >
                              {isEquipped && <ShieldCheck size={14} aria-hidden />}
                              {isEquipped ? 'Equipada' : 'Equipar'}
                              <span className="sr-only"> {name}</span>
                            </button>
                          )}
                          <IconButton label={`Retirar ${name}`} size={40} variant="danger" aria-haspopup="dialog" data-remove="" onClick={() => setConfirmRemoveItem({ type, index: idx, name })}>
                            <Trash2 size={17} aria-hidden />
                          </IconButton>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p style={{ padding: '18px 16px', fontSize: fs.sm, color: c.muted, textAlign: 'center' }}>
                    Sin {label.toLowerCase()} equipadas
                  </p>
                )}
              </Card>
            </section>
          )
        })}
      </div>

      {/* ─── Marcos dialog ─── */}
      <Sheet
        open={!!marcosDialog}
        onClose={() => setMarcosDialog(null)}
        maxWidth={440}
        title={marcosDialog === 'add' ? 'Añadir Marcos' : 'Gastar Marcos'}
        description={marcosDialog === 'add' ? 'Los Marcos se añaden como Infusas.' : `Tienes ${marcosTotal} Marco${marcosTotal !== 1 ? 's' : ''}. Se gastan primero las Opacas.`}
        footer={
          <>
            <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={() => setMarcosDialog(null)}>
              Cancelar
            </Button>
            <Button variant={marcosDialog === 'add' ? 'primary' : 'danger'} size="lg" style={{ flex: 2 }} onClick={confirmMarcos}>
              {marcosDialog === 'add' ? `Añadir ${marcosDelta} Marco${marcosDelta !== 1 ? 's' : ''}` : `Gastar ${marcosDelta} Marco${marcosDelta !== 1 ? 's' : ''}`}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '8px 0 4px' }}>
          <SphereImg src={marcosDialog === 'add' ? IMG_CHIP : IMG_MARCO} size={56} style={marcosDialog === 'add' ? { filter: 'drop-shadow(0 0 10px var(--brand-glow))' } : undefined} />
          <Stepper
            value={marcosDelta}
            onChange={setMarcosDelta}
            min={1}
            max={marcosDialog === 'remove' ? marcosTotal : Infinity}
            label="Cantidad de Marcos"
            format={(v) => <span style={{ fontSize: fs['3xl'] }}>{v}</span>}
          />
        </div>
      </Sheet>

      {/* ─── Item picker ─── */}
      {itemPicker && (() => {
        const config = {
          weapon: { label: 'Armas',     items: catalogWeapons.map((w) => ({ id: w.name, label: w.name, weight: w.weight })) },
          armor:  { label: 'Armaduras', items: catalogArmor.map((a) => ({ id: a.name, label: a.name, weight: a.weight })) },
          gear:   { label: 'Equipo',    items: catalogGear.map((g) => ({ id: g.name, label: g.name, weight: g.weight })) },
        }[itemPicker]
        const cat = CATEGORY[itemPicker]
        const CatIcon = cat.Icon
        const close = () => setItemPicker(null)
        return (
          <Sheet
            open
            onClose={close}
            title={`Añadir ${config.label}`}
            footer={<Button variant="secondary" size="lg" fullWidth onClick={close}>Cerrar</Button>}
          >
            {config.items.length === 0 ? (
              <p role="status" style={{ fontSize: fs.sm, color: c.muted, textAlign: 'center', padding: '20px 0' }}>Cargando...</p>
            ) : (
              <ul role="list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {config.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="ui-card ui-card--interactive"
                      onClick={() => addItem(itemPicker, item.id)}
                      style={{
                        ...buttonReset,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        minHeight: 52,
                        padding: '8px 14px 8px 8px',
                        borderRadius: radius.md,
                        background: c.s1,
                        border: `1px solid ${c.border}`,
                        color: c.text,
                        textAlign: 'left',
                      }}
                    >
                      <span aria-hidden style={{ width: 36, height: 36, borderRadius: radius.sm, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cat.tone.bg, border: `1px solid ${cat.tone.border}`, color: cat.tone.fg }}>
                        <CatIcon size={17} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0, fontSize: fs.base, fontWeight: 550, overflowWrap: 'anywhere' }}>{item.label}</span>
                      <span style={{ fontSize: fs.sm, color: c.muted, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                        <span className="sr-only">, </span>
                        {item.weight} kg
                      </span>
                      <Plus size={16} aria-hidden style={{ color: cat.tone.fg }} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Sheet>
        )
      })()}

      {/* ─── Confirm remove ─── */}
      <ConfirmDialog
        open={!!confirmRemoveItem}
        title="¿Retirar del inventario?"
        message={confirmRemoveItem ? <>Se eliminará <strong style={{ color: 'var(--text)' }}>{confirmRemoveItem.name}</strong> del inventario de {character.name}.</> : undefined}
        confirmLabel="Retirar"
        onConfirm={() => {
          if (!confirmRemoveItem) return
          const { type, index } = confirmRemoveItem
          const count = (type === 'weapon' ? character.weapons : type === 'armor' ? character.armor : character.equipment)?.length ?? 0
          removeItem(type, index)
          keepFocusAfterRemoval(type, index, count)
        }}
        onCancel={() => setConfirmRemoveItem(null)}
      />

      {/* ─── Item detail sheet ─── */}
      {bolsaDetail && (() => {
        const onClose = () => setBolsaDetail(null)
        const weapon = bolsaDetail.kind === 'weapon' ? catalogWeapons.find((w) => w.name === bolsaDetail.name) : null
        const armor  = bolsaDetail.kind === 'armor'  ? catalogArmor.find((a) => a.name === bolsaDetail.name)  : null
        const gear   = bolsaDetail.kind === 'gear'   ? catalogGear.find((g) => g.name === bolsaDetail.name)   : null
        const accent = CATEGORY[bolsaDetail.kind].tone
        const statGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: 8 }
        const traitList: CSSProperties = { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }
        const prose: CSSProperties = { fontSize: fs.sm + 1, color: c.muted, lineHeight: 1.55 }
        return (
          <Sheet
            open
            onClose={onClose}
            title={bolsaDetail.name}
            footer={<Button variant="secondary" size="lg" fullWidth onClick={onClose}>Cerrar</Button>}
          >
            {weapon && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <DetailSection title="Daño">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: font.mono, fontSize: fs.xl, fontWeight: 700, color: accent.fg, padding: '4px 14px', borderRadius: radius.sm, background: accent.bg, border: `1px solid ${accent.border}` }}>
                      {weapon.damageDiceCount}d{weapon.damageDiceValue}
                    </span>
                    <span style={{ fontSize: fs.base, color: c.muted }}>{dtMap.get(weapon.damageTypeId) ?? '—'}</span>
                  </div>
                </DetailSection>
                <DetailSection title="Estadísticas">
                  <dl style={statGrid}>
                    {[{ label: 'Habilidad', value: skMap.get(weapon.skillId) ?? '—' }, { label: 'Tipo', value: wtMap.get(weapon.weaponTypeId) ?? '—' }, { label: 'Alcance', value: rMap.get(weapon.rangeId) ?? '—' }, { label: 'Peso', value: `${weapon.weight} kg` }].map(({ label, value }) => (
                      <StatPill key={label} label={label} value={value} />
                    ))}
                  </dl>
                </DetailSection>
                {(weapon.traitIds.length > 0 || weapon.expertTraitIds.length > 0) && (
                  <DetailSection title="Rasgos">
                    <ul role="list" style={traitList}>
                      {weapon.traitIds.map((id) => { const opt = wtrMap.get(id); return (
                        <TraitRow key={id} name={opt?.name ?? id} description={opt?.description} />
                      )})}
                      {weapon.expertTraitIds.map((id) => { const opt = wtrMap.get(id); return (
                        <TraitRow key={`ex-${id}`} expert name={opt?.name ?? id} description={opt?.description} />
                      )})}
                    </ul>
                  </DetailSection>
                )}
                {weapon.description && (
                  <DetailSection title="Descripción">
                    <p style={prose}>{weapon.description}</p>
                  </DetailSection>
                )}
              </div>
            )}

            {armor && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <DetailSection title="Defensa">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Official character-sheet desvío frame around the value */}
                    <span style={{ display: 'inline-grid', placeItems: 'center', color: c.goldOrnament }}>
                      <CosmereIcon name="marco-desvio" size={56} style={{ gridArea: '1 / 1' }} />
                      <span style={{ gridArea: '1 / 1', ...numeral, fontSize: fs.xl, color: c.text, paddingTop: 4 }}>+{armor.desvio}</span>
                    </span>
                    <span style={{ fontSize: fs.md, fontWeight: 700, letterSpacing: '0.08em', color: accent.fg }}> DEF</span>
                  </div>
                </DetailSection>
                <DetailSection title="Tipo">
                  <dl style={statGrid}>
                    {[{ label: 'Tipo', value: atMap.get(armor.armorTypeId) ?? '—' }, { label: 'Peso', value: `${armor.weight} kg` }].map(({ label, value }) => (
                      <StatPill key={label} label={label} value={value} />
                    ))}
                  </dl>
                </DetailSection>
                {(armor.traitIds.length > 0 || armor.expertTraitIds.length > 0) && (
                  <DetailSection title="Rasgos">
                    <ul role="list" style={traitList}>
                      {armor.traitIds.map((id) => { const opt = atrMap.get(id); return (
                        <TraitRow key={id} name={opt?.name ?? id} description={opt?.description} />
                      )})}
                      {armor.expertTraitIds.map((id) => { const opt = atrMap.get(id); return (
                        <TraitRow key={`ex-${id}`} expert name={opt?.name ?? id} description={opt?.description} />
                      )})}
                    </ul>
                  </DetailSection>
                )}
                {armor.description && (
                  <DetailSection title="Descripción">
                    <p style={prose}>{armor.description}</p>
                  </DetailSection>
                )}
              </div>
            )}

            {gear && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <DetailSection title="Detalles">
                  <dl style={statGrid}>
                    {[{ label: 'Peso', value: `${gear.weight} kg` }, { label: 'Precio', value: `${gear.price} mc` }].map(({ label, value }) => (
                      <StatPill key={label} label={label} value={value} />
                    ))}
                  </dl>
                </DetailSection>
                {gear.description && (
                  <DetailSection title="Descripción">
                    <p style={prose}>{gear.description}</p>
                  </DetailSection>
                )}
              </div>
            )}

            {!weapon && !armor && !gear && (
              <p style={{ fontSize: fs.sm + 1, color: c.muted, textAlign: 'center', padding: '24px 0' }}>
                No se encontró información en el catálogo.
              </p>
            )}
          </Sheet>
        )
      })()}
    </div>
  )
}

const marcoColumn: CSSProperties = {
  padding: '16px 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 10,
  textAlign: 'center',
  minWidth: 0,
}

const marcoCaption: CSSProperties = { fontSize: fs.xs, color: c.muted }
