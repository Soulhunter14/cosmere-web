import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Sword, Shield, Package, X, Plus, Trash2, Pencil, Check, Star, Coins, type LucideIcon } from 'lucide-react'
import { catalogApi } from '../../api/catalog'
import type { CreateWeaponPayload, CreateArmorPayload } from '../../api/catalog'
import {
  Button, EmptyState, Field, IconButton, Input, PageHeader, SectionTitle, Select, Sheet, Spinner, Switch, TabPanel, Tabs, Textarea,
} from '../../components/ui'
import { CosmereIcon } from '../../components/CosmereIcon'
import { cosmereImage } from '../../lib/cosmereAssets'
import { formatMoneda, monedaImagen } from '../../lib/moneda'
import { useCampaignStore, useEra, useWorldConfig } from '../../store/campaignStore'
import { buttonReset, c, card, eyebrow, font, fs, numeral, page, pill, radius, shadow, tone, type Tone } from '../../theme'
import type { WeaponCatalog, ArmorCatalog, GearItem, CatalogOption } from '../../types'

type Tab = 'weapons' | 'armor' | 'gear'

type TraitEntry = { name: string; description: string }

type SelectedItem =
  | { kind: 'weapon'; item: WeaponCatalog; typeName: string; skillName: string; damageTypeName: string; rangeName: string; traits: TraitEntry[]; expertTraits: TraitEntry[] }
  | { kind: 'armor';  item: ArmorCatalog;  typeName: string; traits: TraitEntry[]; expertTraits: TraitEntry[] }
  | { kind: 'gear';   item: GearItem }

/**
 * Category colour language of the catalogue (tabs, tiles, badges, create forms):
 * Armas = rubí · Armaduras = circón · Equipo = amatista. Expert traits are always topacio.
 */
const CATEGORY: Record<Tab, { label: string; icon: LucideIcon; tone: Tone }> = {
  weapons: { label: 'Armas',     icon: Sword,   tone: tone.rubi },
  armor:   { label: 'Armaduras', icon: Shield,  tone: tone.circon },
  gear:    { label: 'Equipo',    icon: Package, tone: tone.amatista },
}
const TABS: Tab[] = ['weapons', 'armor', 'gear']
const KIND_TAB: Record<SelectedItem['kind'], Tab> = { weapon: 'weapons', armor: 'armor', gear: 'gear' }
const EXPERT = tone.topacio
const SPHERE = cosmereImage('esfera-marco-diamante')

function buildMap(options?: CatalogOption[]): Map<number, string> {
  const m = new Map<number, string>()
  options?.forEach((o) => m.set(o.id, o.name))
  return m
}

function buildFullMap(options?: CatalogOption[]): Map<number, CatalogOption> {
  const m = new Map<number, CatalogOption>()
  options?.forEach((o) => m.set(o.id, o))
  return m
}

/* ─── Shared bits ──────────────────────────────────────── */

/** Gem-tinted square with the category icon */
function CategoryTile({ tab, size = 40 }: { tab: Tab; size?: number }) {
  const { icon: Icon, tone: t } = CATEGORY[tab]
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, flexShrink: 0,
        borderRadius: size >= 48 ? radius.md : radius.sm,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(120% 120% at 25% 10%, ${t.border}, ${t.bg} 65%)`,
        border: `1px solid ${t.border}`,
        color: t.fg,
      }}
    >
      <Icon size={Math.round(size * 0.46)} strokeWidth={1.9} />
    </span>
  )
}

function ExpertStar({ size }: { size: number }) {
  return <Star size={size} aria-hidden fill="currentColor" strokeWidth={1.5} />
}

function TraitChip({ label, expert }: { label: string; expert?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 9px', borderRadius: radius.full,
      fontSize: fs.xs, fontWeight: 600, lineHeight: 1.5, whiteSpace: 'nowrap',
      background: expert ? EXPERT.bg : c.s2,
      border: `1px solid ${expert ? EXPERT.border : c.border}`,
      color: expert ? EXPERT.fg : c.muted,
    }}>
      {expert && <ExpertStar size={11} />}
      {label}
      {expert && <span className="sr-only"> (experto)</span>}
    </span>
  )
}

function TraitRow({ name, description, expert }: { name: string; description: string; expert?: boolean }) {
  return (
    <li style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '10px 12px', borderRadius: radius.sm,
      background: expert ? EXPERT.bg : c.s2,
      border: `1px solid ${expert ? EXPERT.border : c.border}`,
    }}>
      <span aria-hidden style={{ display: 'flex', flexShrink: 0, marginTop: expert ? 3 : 6, color: expert ? EXPERT.fg : c.goldOrnament }}>
        {expert ? <ExpertStar size={14} /> : <CosmereIcon name="ornamento-rombo" size={9} square />}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: fs.sm + 1, fontWeight: 650, lineHeight: 1.35, color: expert ? EXPERT.fg : c.text }}>
          {name}
          {expert && <span className="sr-only"> (rasgo de experto)</span>}
        </div>
        {description && (
          <div style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45, marginTop: 2 }}>{description}</div>
        )}
      </div>
    </li>
  )
}

function TraitList({ traits, expertTraits }: { traits: TraitEntry[]; expertTraits: TraitEntry[] }) {
  return (
    <ul role="list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {traits.map((t, i) => <TraitRow key={i} name={t.name} description={t.description} />)}
      {expertTraits.map((t, i) => <TraitRow key={`ex-${i}`} name={t.name} description={t.description} expert />)}
    </ul>
  )
}

/** Label/value tiles (definition list) */
function StatGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
      {items.map((it) => (
        <div key={it.label} style={{ padding: '10px 12px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`, minWidth: 0 }}>
          <dt style={eyebrow}>{it.label}</dt>
          <dd style={{ marginTop: 4, fontSize: fs.base, fontWeight: 600, lineHeight: 1.3, color: c.text, overflowWrap: 'anywhere' }}>{it.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function DetailSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <SectionTitle as="h3" action={action} style={{ marginBottom: 12 }}>{title}</SectionTitle>
      {children}
    </section>
  )
}

/**
 * Price in the money of the world: «5 mc» with the official diamond-mark sphere (the marco), «0,05 ar» with the illustration of the money of the
 * era (L.254 / PDF 260, T45) or a `Coins` glyph while the world has none. The text comes from `formatMoneda`, which leaves a Stormlight price exactly as it was
 */
function Price({ value }: { value: number }) {
  const { moneda } = useWorldConfig()
  const era = useEra()
  const marco = moneda.simbolo === 'mc'
  const img = marco ? SPHERE : monedaImagen(moneda, era)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {img
        ? (marco
          ? <img src={img} alt="" width={15} height={16} style={{ flexShrink: 0 }} />
          : <img src={img} alt="" width={18} height={18} style={{ flexShrink: 0, objectFit: 'contain' }} />)
        : !marco && <Coins size={16} aria-hidden style={{ flexShrink: 0 }} />}
      {formatMoneda(value, moneda)}
    </span>
  )
}

/** Chip of an item that only exists in one era (the book labels the rows «ERA 1» / «ERA 2», L.254-267 / PDF 260-273); label and tone are the world's */
function EraChip({ era }: { era: 1 | 2 }) {
  const { eras } = useWorldConfig()
  const def = eras?.find((e) => e.id === `era${era}`)
  return def ? <span style={pill(def.tone)}>{def.label}</span> : null
}

/** «Precio» tile of a weapon or armor sheet: its price, «Solo recompensa» when it has none because it is a reward, nothing otherwise (every Stormlight weapon and armor) */
const priceTile = (item: { price: number | null; isRewardOnly: boolean }): { label: string; value: ReactNode }[] =>
  item.price != null ? [{ label: 'Precio', value: <Price value={item.price} /> }]
  : item.isRewardOnly ? [{ label: 'Precio', value: 'Solo recompensa' }]
  : []

/** «Era» tile of an item sheet (only the items that exist in a single era have one) */
const eraTile = (item: { era: 1 | 2 | null }): { label: string; value: ReactNode }[] =>
  item.era != null ? [{ label: 'Era', value: <EraChip era={item.era} /> }] : []

/**
 * Visible header of the catalogue sheets. The dialog's accessible name/description come from the Sheet's
 * (visually hidden) header, so this copy of the title is visual only.
 */
function SheetHeader({ tab, title, subtitle, actions }: { tab: Tab; title: string; subtitle?: string; actions: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
      <CategoryTile tab={tab} size={48} />
      <div aria-hidden style={{ flex: 1, minWidth: 0, alignSelf: 'center' }}>
        <p style={{ fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, lineHeight: 1.2, color: c.text, overflowWrap: 'anywhere' }}>
          {title}
        </p>
        {subtitle && <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 3 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginTop: 2, marginRight: -8 }}>{actions}</div>
    </div>
  )
}

// ── Detail sheet ─────────────────────────────────────────────
function DetailSheet({ selected, onClose, isGm, campaignId }: { selected: SelectedItem; onClose: () => void; isGm: boolean; campaignId: number }) {
  const qc = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [descDraft, setDescDraft] = useState('')
  const trashId = useId()
  const confirmId = useId()

  const currentDescription =
    selected.kind === 'weapon' ? selected.item.description
    : selected.kind === 'armor' ? selected.item.description
    : selected.item.description

  // The catalog is served by campaign: every list and option of it lives under ['catalog', campaignId] (the Bolsa shares those keys)
  const updateDescMutation = useMutation({
    mutationFn: (description: string) => {
      if (selected.kind === 'weapon') return catalogApi.updateWeaponDescription(selected.item.id, description, campaignId)
      if (selected.kind === 'armor') return catalogApi.updateArmorDescription(selected.item.id, description, campaignId)
      return catalogApi.updateGearDescription(selected.item.id, description, campaignId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalog', campaignId] })
      setEditingDesc(false)
    },
  })

  const startEditDesc = () => {
    setDescDraft(currentDescription)
    setEditingDesc(true)
  }

  const saveDesc = () => {
    if (!updateDescMutation.isPending) updateDescMutation.mutate(descDraft)
  }

  const deleteWeaponMutation = useMutation({
    mutationFn: () => catalogApi.deleteWeapon((selected as { item: WeaponCatalog }).item.id, campaignId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalog', campaignId] }); onClose() },
  })
  const deleteArmorMutation = useMutation({
    mutationFn: () => catalogApi.deleteArmor((selected as { item: ArmorCatalog }).item.id, campaignId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalog', campaignId] }); onClose() },
  })

  const isCustom =
    (selected.kind === 'weapon' && selected.item.isCustom) ||
    (selected.kind === 'armor' && selected.item.isCustom)

  const handleDelete = () => {
    if (selected.kind === 'weapon') deleteWeaponMutation.mutate()
    else if (selected.kind === 'armor') deleteArmorMutation.mutate()
  }

  // When the confirmation strip is dismissed, give focus back to the trash button it replaced
  const wasConfirming = useRef(false)
  useEffect(() => {
    if (!confirmDelete && wasConfirming.current) document.getElementById(trashId)?.focus()
    wasConfirming.current = confirmDelete
  }, [confirmDelete, trashId])

  const tab = KIND_TAB[selected.kind]
  const t = CATEGORY[tab].tone
  const name =
    selected.kind === 'weapon' ? selected.item.name
    : selected.kind === 'armor' ? selected.item.name
    : selected.item.name
  const subtitle =
    selected.kind === 'weapon' ? `${selected.typeName} · ${selected.rangeName}`
    : selected.kind === 'armor' ? selected.typeName
    : 'Equipo'

  const description = (
    <DescriptionSection
      description={currentDescription}
      isGm={isGm}
      editing={editingDesc}
      draft={descDraft}
      saving={updateDescMutation.isPending}
      onStartEdit={startEditDesc}
      onDraftChange={setDescDraft}
      onSave={saveDesc}
      onCancel={() => setEditingDesc(false)}
    />
  )

  return (
    <Sheet open onClose={onClose} title={name} description={subtitle} hideHeader maxWidth={540}>
      <SheetHeader
        tab={tab}
        title={name}
        subtitle={subtitle}
        actions={
          <>
            {isGm && isCustom && !confirmDelete && (
              <IconButton id={trashId} label="Eliminar ítem" variant="danger" size={44} onClick={() => setConfirmDelete(true)}>
                <Trash2 size={18} aria-hidden />
              </IconButton>
            )}
            <IconButton label="Cerrar" size={44} onClick={onClose} data-autofocus>
              <X size={20} aria-hidden />
            </IconButton>
          </>
        }
      />

      {/* Confirm delete */}
      {confirmDelete && (
        <div
          role="group"
          aria-labelledby={confirmId}
          className="fade-in"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            padding: '12px 14px', marginBottom: 20, borderRadius: radius.md,
            background: tone.rubi.bg, border: `1px solid ${tone.rubi.border}`,
          }}
        >
          <span id={confirmId} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: fs.base - 1, fontWeight: 600, color: c.text }}>
            <Trash2 size={16} aria-hidden style={{ color: tone.rubi.fg }} />
            ¿Eliminar este ítem?
          </span>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)} autoFocus>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteWeaponMutation.isPending || deleteArmorMutation.isPending}
            >
              Eliminar
            </Button>
          </div>
        </div>
      )}

      {/* Weapon detail */}
      {selected.kind === 'weapon' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <DetailSection title="Daño">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: font.mono, fontSize: fs['2xl'], fontWeight: 700, lineHeight: 1, letterSpacing: '-0.01em',
                padding: '10px 18px', borderRadius: radius.md,
                color: t.fg, background: t.bg, border: `1px solid ${t.border}`,
              }}>
                {selected.item.damageDiceCount}d{selected.item.damageDiceValue}
              </span>
              <span style={{ fontSize: fs.base, fontWeight: 550, color: c.muted }}>{selected.damageTypeName}</span>
            </div>
          </DetailSection>

          <DetailSection title="Estadísticas">
            <StatGrid items={[
              { label: 'Habilidad', value: selected.skillName },
              { label: 'Tipo', value: selected.typeName },
              { label: 'Alcance', value: selected.rangeName },
              { label: 'Peso', value: `${selected.item.weight} kg` },
              ...priceTile(selected.item),
              ...eraTile(selected.item),
            ]} />
          </DetailSection>

          {(selected.traits.length > 0 || selected.expertTraits.length > 0) && (
            <DetailSection title="Rasgos">
              <TraitList traits={selected.traits} expertTraits={selected.expertTraits} />
            </DetailSection>
          )}

          {description}
        </div>
      )}

      {/* Armor detail */}
      {selected.kind === 'armor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <DetailSection title="Defensa">
            <DesvioFrame value={selected.item.desvio} />
          </DetailSection>

          <DetailSection title="Tipo">
            <StatGrid items={[
              { label: 'Tipo', value: selected.typeName },
              { label: 'Peso', value: `${selected.item.weight} kg` },
              ...priceTile(selected.item),
              ...eraTile(selected.item),
            ]} />
          </DetailSection>

          {(selected.traits.length > 0 || selected.expertTraits.length > 0) && (
            <DetailSection title="Rasgos">
              <TraitList traits={selected.traits} expertTraits={selected.expertTraits} />
            </DetailSection>
          )}

          {description}
        </div>
      )}

      {/* Gear detail */}
      {selected.kind === 'gear' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <DetailSection title="Detalles">
            <StatGrid items={[
              { label: 'Peso', value: `${selected.item.weight} kg` },
              { label: 'Precio', value: <Price value={selected.item.price} /> },
              ...eraTile(selected.item),
            ]} />
          </DetailSection>

          {description}
        </div>
      )}
    </Sheet>
  )
}

/** "+N DEF" inside the official desvío frame of the character sheet */
function DesvioFrame({ value }: { value: number }) {
  const t = CATEGORY.armor.tone
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 88, height: 78, color: t.fg }}>
      <CosmereIcon name="marco-desvio" size={78} style={{ position: 'absolute', left: 0, top: 0 }} />
      <span style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
        <span style={{ ...numeral, fontSize: fs['2xl'], color: c.text }}>+{value}</span>
        <span style={{ ...eyebrow, color: t.fg, marginTop: 4, letterSpacing: '0.16em' }}> DEF</span>
      </span>
    </span>
  )
}

function DescriptionSection({
  description, isGm, editing, draft, saving,
  onStartEdit, onDraftChange, onSave, onCancel,
}: {
  description: string; isGm: boolean; editing: boolean; draft: string; saving: boolean
  onStartEdit: () => void; onDraftChange: (v: string) => void; onSave: () => void; onCancel: () => void
}) {
  const headingId = useId()
  const editBtnId = useId()
  // Entering edit mode: bring the textarea AND its Cancelar/Guardar buttons into view (autoFocus alone
  // only scrolls the textarea, leaving the actions under the fold at the bottom of the sheet).
  // Leaving it (Cancelar or a successful Guardar): the focused textarea unmounts, so give focus back
  // to the pencil button instead of letting it fall to <body> behind the modal.
  const editRef = useRef<HTMLDivElement>(null)
  const wasEditing = useRef(false)
  useEffect(() => {
    if (editing) editRef.current?.scrollIntoView({ block: 'nearest' })
    else if (wasEditing.current) document.getElementById(editBtnId)?.focus()
    wasEditing.current = editing
  }, [editing, editBtnId])
  return (
    <section>
      <SectionTitle
        as="h3"
        id={headingId}
        style={{ marginBottom: 12 }}
        action={isGm && !editing ? (
          <IconButton id={editBtnId} label="Editar descripción" size={40} onClick={onStartEdit} style={{ marginBottom: -6, marginRight: -8 }}>
            <Pencil size={16} aria-hidden />
          </IconButton>
        ) : undefined}
      >
        Descripción
      </SectionTitle>

      {editing ? (
        <div ref={editRef} style={{ display: 'flex', flexDirection: 'column', gap: 10, scrollMarginBottom: 16 }}>
          <Textarea
            autoFocus
            aria-labelledby={headingId}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Añade una descripción..."
            rows={4}
            style={{ lineHeight: 1.5 }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={onSave} loading={saving} icon={<Check size={16} aria-hidden />}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </div>
      ) : description ? (
        <p style={{ fontFamily: font.display, fontSize: fs.md + 1, lineHeight: 1.55, color: c.text }}>
          {description}
        </p>
      ) : (
        <p style={{ fontFamily: font.display, fontSize: fs.md + 1, color: c.subtle, fontStyle: 'italic' }}>
          Sin descripción
        </p>
      )}
    </section>
  )
}

/* ─── List cards (real buttons) ────────────────────────── */

const cardButton: CSSProperties = {
  ...buttonReset,
  ...card,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  width: '100%',
  padding: '14px 16px',
  textAlign: 'left',
}
const cardTitle: CSSProperties = {
  display: 'block', fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.25, color: c.text, overflowWrap: 'anywhere',
}
const cardMeta: CSSProperties = { display: 'block', fontSize: fs.sm, lineHeight: 1.4, color: c.muted, marginTop: 2 }
/** Content under the title, aligned with it (tile 40 + gap 12) */
const cardIndent: CSSProperties = { paddingLeft: 52 }
const badge = (t: Tone, mono = false): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center',
  padding: '3px 10px', borderRadius: radius.sm,
  fontFamily: mono ? font.mono : font.ui,
  fontSize: fs.base - 1, fontWeight: 700, lineHeight: 1.35, whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
  background: t.bg, color: t.fg, border: `1px solid ${t.border}`,
})

function TraitChips({ traits, expertTraits }: { traits: string[]; expertTraits: string[] }) {
  return (
    <span style={{ ...cardIndent, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {traits.map((t, i) => <TraitChip key={i} label={t} />)}
      {expertTraits.map((t, i) => <TraitChip key={`ex-${i}`} label={t} expert />)}
    </span>
  )
}

/**
 * What a priced catalog adds under a weapon or armor: era chip, «Solo recompensa» chip and price. No element at all when the item has none
 * of them, which is every Stormlight weapon and armor (its cards do not change, P1)
 */
function ItemMeta({ item }: { item: { era: 1 | 2 | null; price: number | null; isRewardOnly: boolean } }) {
  if (item.era == null && item.price == null && !item.isRewardOnly) return null
  return (
    <span style={{ ...cardIndent, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
      {item.era != null && <EraChip era={item.era} />}
      {item.isRewardOnly && <span style={pill(tone.esmeralda)}>Solo recompensa</span>}
      {item.price != null && (
        <span style={{ fontSize: fs.xs, fontWeight: 550, color: c.muted }}><Price value={item.price} /></span>
      )}
    </span>
  )
}

// ── Weapon card ─────────────────────────────────────────────
function WeaponCard({ weapon, typeName, skillName, damageTypeName, rangeName, traits, expertTraits, onClick }: {
  weapon: WeaponCatalog
  typeName: string; skillName: string; damageTypeName: string; rangeName: string
  traits: string[]; expertTraits: string[]
  onClick: () => void
}) {
  const hasTraits = traits.length > 0 || expertTraits.length > 0

  return (
    <button type="button" onClick={onClick} className="ui-card ui-card--interactive" style={cardButton}>
      <span style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
        <CategoryTile tab="weapons" />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={cardTitle}>{weapon.name}</span>
          <span style={cardMeta}>{typeName} · {rangeName}</span>
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={badge(CATEGORY.weapons.tone, true)}>
            {weapon.damageDiceCount}d{weapon.damageDiceValue}
          </span>
          <span style={{ fontSize: fs.xs, color: c.subtle }}>{damageTypeName}</span>
        </span>
      </span>

      {hasTraits && <TraitChips traits={traits} expertTraits={expertTraits} />}

      <span style={{ ...cardIndent, display: 'flex', flexWrap: 'wrap', gap: 4, fontSize: fs.xs, color: c.muted }}>
        <span style={{ color: c.subtle }}>Habilidad:</span>{' '}
        <span style={{ fontWeight: 600 }}>{skillName}</span>
      </span>

      <ItemMeta item={weapon} />
    </button>
  )
}

// ── Armor card ──────────────────────────────────────────────
function ArmorCard({ armor, typeName, traits, expertTraits, onClick }: {
  armor: ArmorCatalog
  typeName: string; traits: string[]; expertTraits: string[]
  onClick: () => void
}) {
  const hasTraits = traits.length > 0 || expertTraits.length > 0

  return (
    <button type="button" onClick={onClick} className="ui-card ui-card--interactive" style={cardButton}>
      <span style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
        <CategoryTile tab="armor" />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={cardTitle}>{armor.name}</span>
          <span style={cardMeta}>{typeName}</span>
        </span>
        <span style={{ ...badge(CATEGORY.armor.tone), flexShrink: 0 }}>
          +{armor.desvio} DEF
        </span>
      </span>

      {hasTraits && <TraitChips traits={traits} expertTraits={expertTraits} />}

      <ItemMeta item={armor} />
    </button>
  )
}

// ── Gear card ───────────────────────────────────────────────
function GearCard({ gear, onClick }: { gear: GearItem; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="ui-card ui-card--interactive" style={cardButton}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <CategoryTile tab="gear" />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={cardTitle}>{gear.name}</span>
          {gear.description && (
            <span style={{ ...cardMeta, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {gear.description}
            </span>
          )}
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{ ...numeral, fontSize: fs.base, color: CATEGORY.gear.tone.fg }}>{gear.weight} kg</span>
          <span style={{ fontSize: fs.xs, fontWeight: 550, color: c.muted }}><Price value={gear.price} /></span>
          {gear.era != null && <EraChip era={gear.era} />}
        </span>
      </span>
    </button>
  )
}

/* ─── Forms ────────────────────────────────────────────── */

const grid2: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }

function MultiSelect({ label, options, selected, onChange, accent, expert = false }: {
  label: string
  options: CatalogOption[]
  selected: number[]
  onChange: (ids: number[]) => void
  accent: Tone
  expert?: boolean
}) {
  const toggle = (id: number) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])

  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      <legend style={{ ...eyebrow, float: 'left', width: '100%', padding: 0, marginBottom: 8 }}>{label}</legend>
      <div style={{ clear: 'both', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => {
          const active = selected.includes(o.id)
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(o.id)}
              className="ui-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                minHeight: 36, padding: active ? '0 12px 0 10px' : '0 12px', borderRadius: radius.full,
                fontSize: fs.sm, fontWeight: active ? 650 : 550, cursor: 'pointer',
                border: `1px solid ${active ? accent.border : c.borderBright}`,
                background: active ? accent.bg : c.s2,
                color: active ? accent.fg : c.muted,
              }}
            >
              {active && (expert ? <ExpertStar size={13} /> : <Check size={14} aria-hidden strokeWidth={2.5} />)}
              {o.name}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function SubmitFooter({ formId, valid, pending, error, label }: {
  formId: string; valid: boolean; pending: boolean; error: boolean; label: string
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {error && (
        <p role="alert" style={{ fontSize: fs.sm, fontWeight: 550, color: tone.rubi.fg, textAlign: 'center' }}>
          Error al guardar. Inténtalo de nuevo.
        </p>
      )}
      {/* Outside the <form> but bound to it with `form`, so Enter-to-submit and the disabled logic still apply */}
      <Button
        type="submit"
        form={formId}
        size="lg"
        fullWidth
        disabled={!valid || pending}
        loading={pending}
        icon={<Plus size={18} aria-hidden />}
      >
        {pending ? 'Guardando…' : label}
      </Button>
    </div>
  )
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <IconButton label="Cerrar" size={44} onClick={onClose}>
      <X size={20} aria-hidden />
    </IconButton>
  )
}

/**
 * What the «Precio» field holds: empty = no price (null), an amount rounded to the decimals of the money, `undefined` = not an amount.
 * (`type="number"` always gives a plain decimal point, whatever the locale)
 */
const readPrice = (text: string, decimals: number): number | null | undefined => {
  const t = text.trim()
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) && n >= 0 ? Number(n.toFixed(decimals)) : undefined
}

/** «Precio» field of the forms of own items (worlds with a priced catalog, in the money of the world); empty = no price */
function PriceField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { moneda } = useWorldConfig()
  return (
    <Field label={`Precio (${moneda.simbolo})`}>
      <Input type="number" inputMode="decimal" min={0} step={1 / 10 ** moneda.decimales} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Sin precio" />
    </Field>
  )
}

/** «Solo recompensa» switch of the forms of own items: the whole row is the label of a real switch */
function RewardSwitch({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  const id = useId()
  const t = tone.esmeralda
  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', minHeight: 56,
        borderRadius: radius.md, cursor: 'pointer',
        border: `1px solid ${checked ? t.border : c.border}`,
        background: checked ? t.bg : c.s2,
        transition: 'background var(--dur-2), border-color var(--dur-2)',
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: fs.sm + 1, fontWeight: 650, color: checked ? t.fg : c.text }}>Solo recompensa</span>
        <span style={{ display: 'block', fontSize: fs.xs, color: c.muted, marginTop: 2, lineHeight: 1.4 }}>
          No se compra: la concede el director.
        </span>
      </span>
      <Switch id={id} checked={checked} onChange={onChange} label="Solo recompensa" />
    </label>
  )
}

// ── Create Weapon Sheet ───────────────────────────────────────
function CreateWeaponSheet({ onClose, options, campaignId }: {
  onClose: () => void
  campaignId: number
  options: {
    weaponTypes: CatalogOption[]; skills: CatalogOption[]; damageTypes: CatalogOption[]
    ranges: CatalogOption[]; traits: CatalogOption[]
  }
}) {
  const qc = useQueryClient()
  const cfg = useWorldConfig()
  // A world with a priced catalog (Mistborn) also asks for the price and whether the item is reward-only; the others send neither
  const priced = cfg.features.catalogoDePrecios
  const formId = useId()
  const mutation = useMutation({
    mutationFn: catalogApi.createWeapon,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalog', campaignId] }); onClose() },
  })
  const [priceText, setPriceText] = useState('')
  const [rewardOnly, setRewardOnly] = useState(false)
  const price = readPrice(priceText, cfg.moneda.decimales)

  const [form, setForm] = useState<CreateWeaponPayload>({
    name: '', weaponTypeId: 0, skillId: 0,
    damageDiceCount: 1, damageDiceValue: 6,
    damageTypeId: 0, rangeId: 0,
    traitIds: [], expertTraitIds: [],
    description: '', weight: 0,
  })

  const set = <K extends keyof CreateWeaponPayload>(k: K, v: CreateWeaponPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const valid = form.name.trim() && form.weaponTypeId && form.skillId &&
    form.damageDiceCount > 0 && form.damageDiceValue > 0 &&
    form.damageTypeId && form.rangeId && !(priced && price === undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    mutation.mutate({ ...form, campaignId, ...(priced ? { price, isRewardOnly: rewardOnly } : {}) })
  }

  const weightField = (
    <Field label="Peso (kg)">
      <Input type="number" inputMode="decimal" min={0} step={0.5} value={form.weight} onChange={(e) => set('weight', +e.target.value)} />
    </Field>
  )

  return (
    <Sheet
      open
      onClose={onClose}
      title="Nueva Arma"
      hideHeader
      maxWidth={560}
      footer={<SubmitFooter formId={formId} valid={!!valid} pending={mutation.isPending} error={mutation.isError} label="Crear Arma" />}
    >
      <SheetHeader tab="weapons" title="Nueva Arma" actions={<CloseButton onClose={onClose} />} />

      <form id={formId} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Nombre">
          <Input data-autofocus aria-required autoComplete="off" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nombre del arma" />
        </Field>

        <div style={grid2}>
          <Field label="Tipo">
            <Select aria-required value={form.weaponTypeId} onChange={(e) => set('weaponTypeId', +e.target.value)}>
              <option value={0}>— Seleccionar —</option>
              {options.weaponTypes.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </Select>
          </Field>
          <Field label="Habilidad">
            <Select aria-required value={form.skillId} onChange={(e) => set('skillId', +e.target.value)}>
              <option value={0}>— Seleccionar —</option>
              {options.skills.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </Select>
          </Field>
        </div>

        <div style={grid2}>
          <Field label="Dados">
            <Input aria-required type="number" inputMode="numeric" min={1} value={form.damageDiceCount} onChange={(e) => set('damageDiceCount', +e.target.value)} />
          </Field>
          <Field label="Caras">
            <Input aria-required type="number" inputMode="numeric" min={1} value={form.damageDiceValue} onChange={(e) => set('damageDiceValue', +e.target.value)} />
          </Field>
        </div>

        <div style={grid2}>
          <Field label="Tipo daño">
            <Select aria-required value={form.damageTypeId} onChange={(e) => set('damageTypeId', +e.target.value)}>
              <option value={0}>—</option>
              {options.damageTypes.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </Select>
          </Field>
          <Field label="Alcance">
            <Select aria-required value={form.rangeId} onChange={(e) => set('rangeId', +e.target.value)}>
              <option value={0}>— Seleccionar —</option>
              {options.ranges.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </Select>
          </Field>
        </div>

        {priced ? (
          <div style={grid2}>
            {weightField}
            <PriceField value={priceText} onChange={setPriceText} />
          </div>
        ) : weightField}

        {priced && <RewardSwitch checked={rewardOnly} onChange={setRewardOnly} />}

        <MultiSelect label="Rasgos" accent={CATEGORY.weapons.tone} options={options.traits} selected={form.traitIds} onChange={(ids) => set('traitIds', ids)} />

        <MultiSelect label="Rasgos de experto" accent={EXPERT} expert options={options.traits} selected={form.expertTraitIds} onChange={(ids) => set('expertTraitIds', ids)} />

        <Field label="Descripción (opcional)">
          <Textarea
            rows={3}
            style={{ lineHeight: 1.5 }}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Descripción del arma..."
          />
        </Field>
      </form>
    </Sheet>
  )
}

// ── Create Armor Sheet ────────────────────────────────────────
function CreateArmorSheet({ onClose, options, campaignId }: {
  onClose: () => void
  campaignId: number
  options: { armorTypes: CatalogOption[]; traits: CatalogOption[] }
}) {
  const qc = useQueryClient()
  const cfg = useWorldConfig()
  // See CreateWeaponSheet: only a world with a priced catalog asks for the price and the reward mark
  const priced = cfg.features.catalogoDePrecios
  const formId = useId()
  const mutation = useMutation({
    mutationFn: catalogApi.createArmor,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalog', campaignId] }); onClose() },
  })
  const [priceText, setPriceText] = useState('')
  const [rewardOnly, setRewardOnly] = useState(false)
  const price = readPrice(priceText, cfg.moneda.decimales)

  const [form, setForm] = useState<CreateArmorPayload>({
    name: '', armorTypeId: 0, desvio: 0, traitIds: [], expertTraitIds: [], description: '', weight: 0,
  })

  const set = <K extends keyof CreateArmorPayload>(k: K, v: CreateArmorPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const valid = form.name.trim() && form.armorTypeId && !(priced && price === undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    mutation.mutate({ ...form, campaignId, ...(priced ? { price, isRewardOnly: rewardOnly } : {}) })
  }

  const weightField = (
    <Field label="Peso (kg)">
      <Input type="number" inputMode="decimal" min={0} step={0.5} value={form.weight} onChange={(e) => set('weight', +e.target.value)} />
    </Field>
  )

  return (
    <Sheet
      open
      onClose={onClose}
      title="Nueva Armadura"
      hideHeader
      maxWidth={560}
      footer={<SubmitFooter formId={formId} valid={!!valid} pending={mutation.isPending} error={mutation.isError} label="Crear Armadura" />}
    >
      <SheetHeader tab="armor" title="Nueva Armadura" actions={<CloseButton onClose={onClose} />} />

      <form id={formId} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Nombre">
          <Input data-autofocus aria-required autoComplete="off" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nombre de la armadura" />
        </Field>

        <div style={grid2}>
          <Field label="Tipo">
            <Select aria-required value={form.armorTypeId} onChange={(e) => set('armorTypeId', +e.target.value)}>
              <option value={0}>— Seleccionar —</option>
              {options.armorTypes.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </Select>
          </Field>
          <Field label="Desvío (DEF)">
            <Input type="number" inputMode="numeric" min={0} value={form.desvio} onChange={(e) => set('desvio', +e.target.value)} />
          </Field>
        </div>

        {priced ? (
          <div style={grid2}>
            {weightField}
            <PriceField value={priceText} onChange={setPriceText} />
          </div>
        ) : weightField}

        {priced && <RewardSwitch checked={rewardOnly} onChange={setRewardOnly} />}

        <MultiSelect label="Rasgos" accent={CATEGORY.armor.tone} options={options.traits} selected={form.traitIds} onChange={(ids) => set('traitIds', ids)} />

        <MultiSelect label="Rasgos de experto" accent={EXPERT} expert options={options.traits} selected={form.expertTraitIds} onChange={(ids) => set('expertTraitIds', ids)} />

        <Field label="Descripción (opcional)">
          <Textarea
            rows={3}
            style={{ lineHeight: 1.5 }}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Descripción de la armadura..."
          />
        </Field>
      </form>
    </Sheet>
  )
}

/* ─── List wrapper ─────────────────────────────────────── */
const listStyle: CSSProperties = { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }
const riseItem = (i: number) => ({ '--i': Math.min(i, 12) }) as CSSProperties

// ── Main page ───────────────────────────────────────────────
export function CatalogPage() {
  const [tab, setTab] = useState<Tab>('weapons')
  const [selected, setSelected] = useState<SelectedItem | null>(null)
  const [showCreateWeapon, setShowCreateWeapon] = useState(false)
  const [showCreateArmor, setShowCreateArmor] = useState(false)
  const { isGm, currentCampaign } = useCampaignStore()
  // The catalog is served by campaign (its world and, in Mistborn, its era). AppLayout renders the page only once the store holds the campaign of
  // the URL, so this is never 0; the keys are shared with the pickers of the Bolsa, so an item created here is in them at once
  const cId = currentCampaign?.id ?? 0

  // Item data (an arrow: TanStack would call a bare reference with its QueryFunctionContext as `campaignId`, and the server would silently answer Stormlight)
  const { data: weapons, isLoading: wLoad } = useQuery({ queryKey: ['catalog', cId, 'weapons'], queryFn: () => catalogApi.getWeapons(cId) })
  const { data: armor,   isLoading: aLoad } = useQuery({ queryKey: ['catalog', cId, 'armor'],   queryFn: () => catalogApi.getArmor(cId) })
  const { data: gear,    isLoading: gLoad } = useQuery({ queryKey: ['catalog', cId, 'gear'],    queryFn: () => catalogApi.getGear(cId) })

  // Lookup options (the shared Cosmere ones plus those of the world of the campaign)
  const { data: optWeaponType }  = useQuery({ queryKey: ['catalog', cId, 'opts', 'WEAPON_TYPE'],  queryFn: () => catalogApi.getOptions('WEAPON_TYPE', cId) })
  const { data: optSkill }       = useQuery({ queryKey: ['catalog', cId, 'opts', 'SKILL'],        queryFn: () => catalogApi.getOptions('SKILL', cId) })
  const { data: optDamageType }  = useQuery({ queryKey: ['catalog', cId, 'opts', 'DAMAGE_TYPE'],  queryFn: () => catalogApi.getOptions('DAMAGE_TYPE', cId) })
  const { data: optRange }       = useQuery({ queryKey: ['catalog', cId, 'opts', 'RANGE'],        queryFn: () => catalogApi.getOptions('RANGE', cId) })
  const { data: optWeaponTrait } = useQuery({ queryKey: ['catalog', cId, 'opts', 'WEAPON_TRAIT'], queryFn: () => catalogApi.getOptions('WEAPON_TRAIT', cId) })
  const { data: optArmorType }   = useQuery({ queryKey: ['catalog', cId, 'opts', 'ARMOR_TYPE'],   queryFn: () => catalogApi.getOptions('ARMOR_TYPE', cId) })
  const { data: optArmorTrait }  = useQuery({ queryKey: ['catalog', cId, 'opts', 'ARMOR_TRAIT'],  queryFn: () => catalogApi.getOptions('ARMOR_TRAIT', cId) })

  const wtMap      = buildMap(optWeaponType)
  const skMap      = buildMap(optSkill)
  const dtMap      = buildMap(optDamageType)
  const rMap       = buildMap(optRange)
  const wtrMap     = buildMap(optWeaponTrait)
  const atMap      = buildMap(optArmorType)
  const atrMap     = buildMap(optArmorTrait)
  const wtrFullMap = buildFullMap(optWeaponTrait)
  const atrFullMap = buildFullMap(optArmorTrait)

  const isLoading = wLoad || aLoad || gLoad

  return (
    <div style={page}>

      {/* ── Header ──────────────────────────────────────── */}
      <PageHeader
        title="Catálogo"
        subtitle="Equipo disponible en el sistema"
        actions={isGm && (tab === 'weapons' || tab === 'armor') ? (
          <Button
            icon={<Plus size={18} aria-hidden />}
            onClick={() => tab === 'weapons' ? setShowCreateWeapon(true) : setShowCreateArmor(true)}
          >
            <span className="sr-only">Nueva </span>
            {tab === 'weapons' ? 'Arma' : 'Armadura'}
          </Button>
        ) : undefined}
      />

      {/* Tab selector: a floating pill that sticks under the top bar while the list scrolls */}
      <div className="sticky-under-topbar" style={{ margin: '-8px 0 8px', padding: '8px 0' }}>
        <Tabs<Tab>
          stretch
          style={{ boxShadow: shadow[2] }}
          idPrefix="catalogo"
          ariaLabel="Categorías del catálogo"
          value={tab}
          onChange={setTab}
          tabs={TABS.map((key) => {
            const { label, icon: Icon, tone: t } = CATEGORY[key]
            return { id: key, label, icon: <Icon size={16} aria-hidden style={{ color: t.fg }} /> }
          })}
        />
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <TabPanel idPrefix="catalogo" id={tab}>
        {isLoading && <Spinner />}

        {/* WEAPONS */}
        {tab === 'weapons' && !wLoad && (
          weapons?.length === 0 ? (
            <EmptyState icon={<Sword size={22} aria-hidden />} title="Sin armas en el catálogo" />
          ) : (
            <ul role="list" style={listStyle}>
              {weapons?.map((w, i) => {
                const typeName        = wtMap.get(w.weaponTypeId) ?? '—'
                const skillName       = skMap.get(w.skillId) ?? '—'
                const damageTypeName  = dtMap.get(w.damageTypeId) ?? '—'
                const rangeName       = rMap.get(w.rangeId) ?? '—'
                const traits          = w.traitIds.map((id) => ({ name: wtrMap.get(id) ?? '?', description: wtrFullMap.get(id)?.description ?? '' }))
                const expertTraits    = w.expertTraitIds.map((id) => ({ name: wtrMap.get(id) ?? '?', description: wtrFullMap.get(id)?.description ?? '' }))
                return (
                  <li key={w.id} className="rise" style={riseItem(i)}>
                    <WeaponCard
                      weapon={w}
                      typeName={typeName} skillName={skillName}
                      damageTypeName={damageTypeName} rangeName={rangeName}
                      traits={traits.map((t) => t.name)} expertTraits={expertTraits.map((t) => t.name)}
                      onClick={() => setSelected({ kind: 'weapon', item: w, typeName, skillName, damageTypeName, rangeName, traits, expertTraits })}
                    />
                  </li>
                )
              })}
            </ul>
          )
        )}

        {/* ARMOR */}
        {tab === 'armor' && !aLoad && (
          armor?.length === 0 ? (
            <EmptyState icon={<Shield size={22} aria-hidden />} title="Sin armaduras en el catálogo" />
          ) : (
            <ul role="list" style={listStyle}>
              {armor?.map((a, i) => {
                const typeName     = atMap.get(a.armorTypeId) ?? '—'
                const traits       = a.traitIds.map((id) => ({ name: atrMap.get(id) ?? '?', description: atrFullMap.get(id)?.description ?? '' }))
                const expertTraits = a.expertTraitIds.map((id) => ({ name: atrMap.get(id) ?? '?', description: atrFullMap.get(id)?.description ?? '' }))
                return (
                  <li key={a.id} className="rise" style={riseItem(i)}>
                    <ArmorCard
                      armor={a}
                      typeName={typeName} traits={traits.map((t) => t.name)} expertTraits={expertTraits.map((t) => t.name)}
                      onClick={() => setSelected({ kind: 'armor', item: a, typeName, traits, expertTraits })}
                    />
                  </li>
                )
              })}
            </ul>
          )
        )}

        {/* GEAR */}
        {tab === 'gear' && !gLoad && (
          gear?.length === 0 ? (
            <EmptyState icon={<Package size={22} aria-hidden />} title="Sin equipo en el catálogo" />
          ) : (
            <ul role="list" style={listStyle}>
              {gear?.map((g, i) => (
                <li key={g.id} className="rise" style={riseItem(i)}>
                  <GearCard gear={g} onClick={() => setSelected({ kind: 'gear', item: g })} />
                </li>
              ))}
            </ul>
          )
        )}
      </TabPanel>

      {/* ── Detail sheet ────────────────────────────────── */}
      {selected && <DetailSheet selected={selected} onClose={() => setSelected(null)} isGm={isGm} campaignId={cId} />}

      {/* ── Create sheets ───────────────────────────────── */}
      {showCreateWeapon && (
        <CreateWeaponSheet
          onClose={() => setShowCreateWeapon(false)}
          campaignId={cId}
          options={{
            weaponTypes: optWeaponType ?? [],
            skills: optSkill ?? [],
            damageTypes: optDamageType ?? [],
            ranges: optRange ?? [],
            traits: optWeaponTrait ?? [],
          }}
        />
      )}
      {showCreateArmor && (
        <CreateArmorSheet
          onClose={() => setShowCreateArmor(false)}
          campaignId={cId}
          options={{
            armorTypes: optArmorType ?? [],
            traits: optArmorTrait ?? [],
          }}
        />
      )}
    </div>
  )
}
