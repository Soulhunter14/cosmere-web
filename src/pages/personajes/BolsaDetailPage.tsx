import { useState, useEffect, useRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode, type Ref } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { Plus, Minus, Trash2, Info, Sword, Shield, ShieldCheck, Package, ShoppingBag, Star, TriangleAlert, Coins, Check, Search, type LucideIcon } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { catalogApi } from '../../api/catalog'
import { Button, Card, ConfirmDialog, ErrorMessage, Field, IconButton, Input, SectionTitle, Sheet, Spinner, Stepper } from '../../components/ui'
import type { Character, UpdateCharacterRequest, WeaponCatalog, ArmorCatalog, GearItem, CatalogOption } from '../../types'
import { CharacterIdentityPills } from '../../components/CharacterIdentityPills'
import { CharacterHero } from '../../components/CharacterHero'
import { CosmereIcon } from '../../components/CosmereIcon'
import { heroPill, onGem, onGemSoft } from '../../lib/hero'
import { cosmereImage } from '../../lib/cosmereAssets'
import { formatMoneda, monedaImagen, type Moneda } from '../../lib/moneda'
import { filterPickerItems, isPickable } from '../../lib/catalogo'
import { useEra, useWorldConfig } from '../../store/campaignStore'
import type { WorldConfig } from '../../worlds/types'
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

/** Official illustration of the money of the era (T45), or a Coins glyph in a tinted tile while the world or the era has none */
function MonedaImg({ src, size }: { src?: string; size: number }) {
  if (src) return <img src={src} alt="" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} />
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, background: tone.esmeralda.bg, border: `1px solid ${tone.esmeralda.border}`, color: tone.esmeralda.fg }}
    >
      <Coins size={Math.round(size / 2)} />
    </span>
  )
}

/** What was typed in the «Añadir / Gastar arquillas» dialogs: «12,5», «12.5» and «3» give 12.5, 12.5 and 3. `null` = not an amount (empty, letters, a sign, more than 2 decimals…) */
function leerCantidad(texto: string): number | null {
  const t = texto.trim().replace(',', '.')
  return /^\d{0,9}(\.\d{0,2})?$/.test(t) && /\d/.test(t) ? Number(t) : null
}

/** «Era» tile of an item sheet: only the items that exist in a single era (L.254-267 / PDF 260-273) have one */
const eraTiles = (era: 1 | 2 | null, cfg: WorldConfig): { label: string; value: string }[] => {
  const def = era != null ? cfg.eras?.find((e) => e.id === `era${era}`) : undefined
  return def ? [{ label: 'Era', value: def.label }] : []
}

/** «Precio» (or «Solo recompensa») and «Era» tiles of a weapon or armor sheet: nothing for an item that has neither, which is every Stormlight one */
const priceEraTiles = (item: { price: number | null; isRewardOnly: boolean; era: 1 | 2 | null }, cfg: WorldConfig): { label: string; value: string }[] => [
  ...(item.price != null ? [{ label: 'Precio', value: formatMoneda(item.price, cfg.moneda) }] : item.isRewardOnly ? [{ label: 'Precio', value: 'Solo recompensa' }] : []),
  ...eraTiles(item.era, cfg),
]

/* ─── Item picker ──────────────────────────────────────────────────────── */

/** A row of the picker: the bag stores names, so `id` is the name; `price` and `group` (type of weapon) only travel in a world with a priced catalog */
type PickerItem = { id: string; label: string; weight: number; price?: number | null; group?: number }

/**
 * The picker behind the «Añadir» buttons. A world with a priced catalog (Mistborn: 35 weapons, 79 objects) gets a search box, the price of each item and,
 * for weapons, chips by type; any other world (Stormlight) gets the plain list it always had (P1)
 */
function ItemPicker({ kind, label, items, groups, searchable, moneda, onPick, onClose }: {
  kind: ItemKind
  label: string
  items: PickerItem[]
  /** Types of weapon in `items`, for the chips (fewer than two: no chips) */
  groups: { id: number; label: string }[]
  /** Search box, prices and chips (worlds with a priced catalog); `false` = the plain list */
  searchable: boolean
  moneda: Moneda
  onPick: (name: string) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState<number | null>(null)
  const cat = CATEGORY[kind]
  const CatIcon = cat.Icon
  const shown = searchable ? filterPickerItems(items, search, group) : items
  const filtering = search.trim() !== '' || group !== null
  return (
    <Sheet
      open
      onClose={onClose}
      title={`Añadir ${label}`}
      footer={<Button variant="secondary" size="lg" fullWidth onClick={onClose}>Cerrar</Button>}
    >
      {searchable && items.length > 0 && (
        <>
          {/* The search box stays at the top of the sheet while the long list scrolls under it */}
          <div style={{ position: 'sticky', top: 0, zIndex: 1, margin: '0 -20px 10px', padding: '0 20px 8px', background: 'var(--surface-1)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} aria-hidden style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: c.subtle, pointerEvents: 'none' }} />
              <Input
                type="search"
                aria-label={`Buscar en ${label.toLowerCase()}`}
                placeholder="Buscar por nombre…"
                autoComplete="off"
                enterKeyHint="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>
            {/* The count is announced while the list is filtered; an empty result is announced by its own message below */}
            <p className="sr-only" role="status">{filtering && shown.length > 0 ? `${shown.length} resultado${shown.length !== 1 ? 's' : ''}` : ''}</p>
          </div>
          {groups.length > 1 && (
            <div role="group" aria-label="Tipo de arma" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {[{ id: null, label: 'Todas' }, ...groups].map((g) => {
                const on = group === g.id
                return (
                  <button
                    key={g.id ?? 'todas'}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setGroup(g.id)}
                    className="ui-btn"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      minHeight: 36, padding: on ? '0 12px 0 10px' : '0 12px', borderRadius: radius.full,
                      fontSize: fs.sm, fontWeight: on ? 650 : 550, cursor: 'pointer',
                      border: `1px solid ${on ? cat.tone.border : c.borderBright}`,
                      background: on ? cat.tone.bg : c.s2,
                      color: on ? cat.tone.fg : c.muted,
                    }}
                  >
                    {on && <Check size={14} aria-hidden strokeWidth={2.5} />}
                    {g.label}
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
      {items.length === 0 ? (
        <p role="status" style={{ fontSize: fs.sm, color: c.muted, textAlign: 'center', padding: '20px 0' }}>Cargando...</p>
      ) : shown.length === 0 ? (
        <p role="status" style={{ fontSize: fs.sm, color: c.muted, textAlign: 'center', padding: '20px 0' }}>Sin resultados</p>
      ) : (
        <ul role="list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shown.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="ui-card ui-card--interactive"
                onClick={() => onPick(item.id)}
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
                  {item.price != null && ` · ${formatMoneda(item.price, moneda)}`}
                </span>
                <Plus size={16} aria-hidden style={{ color: cat.tone.fg }} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  )
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
  // Nacidos de la bruma: the money is «Arquillas» (features.arquillas) and the capacity tables carry a lifting column (cfg.tablas)
  const cfg = useWorldConfig()
  const era = useEra()
  const [arquillasDialog, setArquillasDialog] = useState<'add' | 'remove' | null>(null)
  const [arquillasTexto, setArquillasTexto] = useState('')
  const addArquillasButton = useRef<HTMLButtonElement>(null)

  const { data: character, isLoading } = useQuery<Character>({
    queryKey: ['character', cId, charId],
    queryFn: () => charactersApi.getById(cId, charId),
  })

  useEffect(() => {
    // Optimistic local copy, re-synced from the server on every refetch (pre-existing behaviour, kept as is)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (character) setMarcos({ infusas: character.marcosInfusas ?? 0, opacas: character.marcosOpacas ?? 0 })
  }, [character])

  // The catalog of the campaign (its world and, in Mistborn, its era): the same keys as CatalogPage, so an item created there is here at once.
  // Arrows, not bare references: TanStack would call `catalogApi.getWeapons` with its QueryFunctionContext as `campaignId`, and the server would silently answer Stormlight
  const { data: catalogWeapons = [] } = useQuery<WeaponCatalog[]>({ queryKey: ['catalog', cId, 'weapons'], queryFn: () => catalogApi.getWeapons(cId) })
  const { data: catalogArmor = [] }   = useQuery<ArmorCatalog[]>({  queryKey: ['catalog', cId, 'armor'],   queryFn: () => catalogApi.getArmor(cId) })
  const { data: catalogGear = [] }    = useQuery<GearItem[]>({       queryKey: ['catalog', cId, 'gear'],    queryFn: () => catalogApi.getGear(cId) })

  const { data: optWeaponType }  = useQuery<CatalogOption[]>({ queryKey: ['catalog', cId, 'opts', 'WEAPON_TYPE'],  queryFn: () => catalogApi.getOptions('WEAPON_TYPE', cId) })
  const { data: optSkill }       = useQuery<CatalogOption[]>({ queryKey: ['catalog', cId, 'opts', 'SKILL'],        queryFn: () => catalogApi.getOptions('SKILL', cId) })
  const { data: optDamageType }  = useQuery<CatalogOption[]>({ queryKey: ['catalog', cId, 'opts', 'DAMAGE_TYPE'],  queryFn: () => catalogApi.getOptions('DAMAGE_TYPE', cId) })
  const { data: optRange }       = useQuery<CatalogOption[]>({ queryKey: ['catalog', cId, 'opts', 'RANGE'],        queryFn: () => catalogApi.getOptions('RANGE', cId) })
  const { data: optWeaponTrait } = useQuery<CatalogOption[]>({ queryKey: ['catalog', cId, 'opts', 'WEAPON_TRAIT'], queryFn: () => catalogApi.getOptions('WEAPON_TRAIT', cId) })
  const { data: optArmorType }   = useQuery<CatalogOption[]>({ queryKey: ['catalog', cId, 'opts', 'ARMOR_TYPE'],   queryFn: () => catalogApi.getOptions('ARMOR_TYPE', cId) })
  const { data: optArmorTrait }  = useQuery<CatalogOption[]>({ queryKey: ['catalog', cId, 'opts', 'ARMOR_TRAIT'],  queryFn: () => catalogApi.getOptions('ARMOR_TRAIT', cId) })

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

  // «Arquillas» (Nacidos de la bruma, §5.2): the purse lives on the server (`recursos.arquillas`, PATCH …/recursos) and never travels in the PUT of
  // the whole character. Same recipe as the table state of the sheet (`mesa`, T29), for a counter that gets tapped fast: the change is written into
  // every cached copy of the character at the call (synchronously, so the next tap starts from it and not from the last render), the requests go
  // out one after the other in the order they were tapped (`colaMesa`: ten +0,01 taps from 0,1 end as exactly 0,2 on the server whatever the
  // network does with them) and only the LAST one to settle refetches, so a slow answer never puts an old value back on screen. The answers are
  // never written into the cache (the server computes them out of combat, §2): the refetch brings them. The queue is a plain promise chain and not
  // the `scope` of TanStack: a scoped mutation only continues while the tab is in the foreground, so someone who taps ten times and puts the phone
  // away would keep only the first tap
  const prefijoFicha = ['character', cId, charId]
  const colaMesa = useRef<Promise<unknown>>(Promise.resolve())
  const mesaClave = ['mesa', cId, charId]
  const arquillasMutation = useMutation({
    mutationKey: mesaClave,
    mutationFn: ({ valor }: { valor: number; previas: [QueryKey, Character | undefined][] }) => {
      const enviar = () => charactersApi.patchRecursos(cId, charId, { recursos: { arquillas: valor } })
      const turno = colaMesa.current.then(enviar, enviar) // after the previous one, whether it worked or not
      colaMesa.current = turno.catch(() => undefined)
      return turno
    },
    onError: (_error, { previas }) => previas.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSettled: () => {
      if (qc.isMutating({ mutationKey: mesaClave }) > 1) return // another one is still on its way: it refreshes when it settles
      qc.invalidateQueries({ queryKey: prefijoFicha })
      qc.invalidateQueries({ queryKey: ['characters', cId] })
    },
  })

  // One step of «Arquillas» from the LATEST value in the cache, which already holds the steps tapped before it (a button only knows the last render)
  function cambiarArquillas(delta: number) {
    const vivo = qc.getQueryData<Character>(prefijoFicha)?.recursos?.arquillas ?? 0
    const siguiente = Math.max(0, Number((vivo + delta).toFixed(2)))
    if (siguiente === vivo) return
    void qc.cancelQueries({ queryKey: prefijoFicha }) // starts cancelling at once: a refetch in flight must not overwrite the change
    const previas = qc.getQueriesData<Character>({ queryKey: prefijoFicha })
    qc.setQueriesData<Character>({ queryKey: prefijoFicha }, (old) => old && { ...old, recursos: { ...old.recursos, arquillas: siguiente } })
    arquillasMutation.mutate({ valor: siguiente, previas })
  }

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

  // «Arquillas»: what the character carries and the dialogs' amount
  const arquillas = character.recursos?.arquillas ?? 0
  const monedaImg = monedaImagen(cfg.moneda, era)
  const cantidadArquillas = leerCantidad(arquillasTexto)
  const errorArquillas = /^[.,]?$/.test(arquillasTexto.trim()) ? undefined // nothing yet, or just the separator: still being typed
    : cantidadArquillas === null ? 'Escribe una cantidad con, como máximo, 2 decimales (0,01 ar es un óbolo).'
    : arquillasDialog === 'remove' && cantidadArquillas > arquillas ? 'No tienes tantas arquillas.'
    : undefined
  const arquillasValida = cantidadArquillas !== null && cantidadArquillas > 0 && !errorArquillas
  const abrirArquillas = (tipo: 'add' | 'remove') => { setArquillasTexto(''); setArquillasDialog(tipo) }
  const confirmarArquillas = () => {
    if (!arquillasDialog || !arquillasValida || cantidadArquillas === null) return
    cambiarArquillas(arquillasDialog === 'add' ? cantidadArquillas : -cantidadArquillas)
    // Spending everything disables "Gastar", so the dialog's focus restore would fall to <body>
    if (arquillasDialog === 'remove' && cantidadArquillas >= arquillas) window.setTimeout(() => addArquillasButton.current?.focus(), 0)
    setArquillasDialog(null)
  }

  // Capacity tables of the world (L.50 / PDF 56), indexed by Fuerza bracket: 0 · 1-2 · 3-4 · 5-6 · 7-8 · 9 or more. In a world whose attribute bonuses
  // come from the server the Fuerza that counts is the one the sheet shows, bonuses included [inferido: L.50 / PDF 56 does not mention them, but a
  // Blessing says «Tu Fuerza aumenta en 1», L.34 / PDF 40]
  const tramoDeFuerza = (f: number) => (f === 0 ? 0 : f <= 2 ? 1 : f <= 4 ? 2 : f <= 6 ? 3 : f <= 8 ? 4 : 5)
  const getCapacity = (f: number) => cfg.tablas.cargaKg[tramoDeFuerza(f)]
  const fuerza = (character.fuerza ?? 0) + (cfg.features.bonosServidor ? (character.bonosAtributos?.fuerza ?? 0) : 0)
  const capacity = getCapacity(fuerza)
  const lifting = cfg.tablas.levantamientoKg?.[tramoDeFuerza(fuerza)] // Stormlight declares no lifting table: the line does not exist there
  const currentWeight =
    (character.weapons ?? []).reduce((sum, name) => sum + (catalogWeapons.find((w) => w.name === name)?.weight ?? 0), 0) +
    (character.armor ?? []).reduce((sum, name) => sum + (catalogArmor.find((a) => a.name === name)?.weight ?? 0), 0) +
    (character.equipment ?? []).reduce((sum, name) => sum + (catalogGear.find((g) => g.name === name)?.weight ?? 0), 0)
  const weightPct = Math.min(currentWeight / capacity, 1)
  // Same thresholds as before: ≥100% rubí (sobrecarga) · ≥75% topacio (aviso) · otherwise esmeralda
  const barTone = weightPct >= 1 ? tone.rubi : weightPct >= 0.75 ? tone.topacio : tone.esmeralda
  const weightLabel = Number.isInteger(currentWeight) ? `${currentWeight}` : currentWeight.toFixed(1)
  const capLabel = Number.isInteger(capacity) ? `${capacity}` : capacity.toFixed(1)
  const liftLabel = lifting === undefined ? '' : Number.isInteger(lifting) ? `${lifting}` : lifting.toFixed(1)

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
        {/* ─── Arquillas: the money of Nacidos de la bruma (L.254 / PDF 260) ─── */}
        {cfg.features.arquillas && (
          <section aria-labelledby="bolsa-arquillas">
            <SectionTitle
              id="bolsa-arquillas"
              action={
                <div style={{ display: 'flex', gap: 8 }}>
                  <ToneButton
                    ref={addArquillasButton}
                    t={tone.esmeralda}
                    icon={<Plus size={15} aria-hidden />}
                    aria-label="Añadir arquillas"
                    aria-haspopup="dialog"
                    onClick={() => abrirArquillas('add')}
                  >
                    Añadir
                  </ToneButton>
                  <ToneButton
                    t={tone.rubi}
                    icon={<Minus size={15} aria-hidden />}
                    aria-label="Gastar arquillas"
                    aria-haspopup="dialog"
                    onClick={() => abrirArquillas('remove')}
                    disabled={arquillas === 0}
                    style={{ cursor: arquillas === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    Gastar
                  </ToneButton>
                </div>
              }
            >
              {cfg.moneda.nombre}
            </SectionTitle>
            <Card padding={0} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap', padding: '14px 16px' }}>
                <MonedaImg src={monedaImg} size={56} />
                {/* One tap = one óbolo (0,01 ar). The Stepper only says which way; the amount comes from the cache (cambiarArquillas) */}
                <Stepper
                  label="Arquillas"
                  value={arquillas}
                  min={0}
                  step={0.01}
                  decimals={2}
                  onChange={(v) => cambiarArquillas(Number((v - arquillas).toFixed(2)))}
                  format={(v) => <span style={{ fontSize: 'clamp(20px, 6.5vw, 28px)' }}>{formatMoneda(v, cfg.moneda, { fija: true })}</span>}
                />
              </div>
              <p style={{ padding: '10px 16px 12px', borderTop: `1px solid ${c.border}`, fontSize: fs.xs, color: c.muted, textAlign: 'center' }}>
                Cada toque suma o resta un óbolo (0,01 ar). Para cantidades mayores usa Añadir o Gastar.
              </p>
              {arquillasMutation.isError && (
                <ErrorMessage message="No se han podido guardar las arquillas. Inténtalo de nuevo." style={{ margin: '0 16px 14px' }} />
              )}
            </Card>
          </section>
        )}

        {/* ─── Marcos ─── */}
        {cfg.features.marcos && (
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
        )}

        {/* ─── Capacidad de carga ─── */}
        <section aria-labelledby="bolsa-carga">
          <SectionTitle
            id="bolsa-carga"
            action={
              <span style={{ fontSize: fs.sm, color: c.muted, whiteSpace: 'nowrap' }}>
                Fuerza <strong style={{ ...numeral, fontSize: fs.base, color: c.text }}>{fuerza}</strong>
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
            {lifting !== undefined && (
              <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 12 }}>
                Levantar hasta <strong style={{ ...numeral, fontSize: fs.base, color: c.text }}>{liftLabel}</strong> kg
              </p>
            )}
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
              {/* A feruchemical power is its own metalmind: its charges live in «Artes metálicas», not here (Q23) */}
              {type === 'gear' && cfg.features.artesMetalicas && character.poderes.some((p) => p.arte === 'feruquimia') && (
                <Link
                  to={`/campaigns/${cId}/characters/${charId}`}
                  state={{ tab: 'artesMetalicas' }}
                  className="ui-link"
                  style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, marginTop: 4, padding: '0 2px', fontSize: fs.sm, fontWeight: 650 }}
                >
                  Cargas en Artes metálicas →
                </Link>
              )}
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

      {/* ─── Arquillas dialog ─── */}
      <Sheet
        open={!!arquillasDialog}
        onClose={() => setArquillasDialog(null)}
        maxWidth={440}
        title={arquillasDialog === 'add' ? 'Añadir arquillas' : 'Gastar arquillas'}
        description={arquillasDialog === 'add' ? 'La cantidad se suma a las arquillas de la bolsa.' : `Tienes ${formatMoneda(arquillas, cfg.moneda, { fija: true })}.`}
        footer={
          <>
            <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={() => setArquillasDialog(null)}>
              Cancelar
            </Button>
            <Button variant={arquillasDialog === 'add' ? 'primary' : 'danger'} size="lg" style={{ flex: 2 }} disabled={!arquillasValida} onClick={confirmarArquillas}>
              {`${arquillasDialog === 'add' ? 'Añadir' : 'Gastar'}${cantidadArquillas ? ` ${formatMoneda(cantidadArquillas, cfg.moneda, { fija: true })}` : ''}`}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '8px 0 4px' }}>
          <MonedaImg src={monedaImg} size={56} />
          <Field label="Cantidad en arquillas" hint="Los óbolos van como decimales: 0,05 ar son 5 óbolos." error={errorArquillas} style={{ width: '100%' }}>
            <Input
              type="text"
              inputMode="decimal"
              enterKeyHint="done"
              autoComplete="off"
              placeholder="0,00"
              value={arquillasTexto}
              onChange={(e) => setArquillasTexto(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmarArquillas() } }}
              data-autofocus
              style={{ textAlign: 'center', fontSize: fs.xl }}
            />
          </Field>
        </div>
      </Sheet>

      {/* ─── Item picker ─── */}
      {itemPicker && (() => {
        // Neither a reward-only item nor a metal vial is offered (Q21: the vials of a metal live in `poderes[].viales`, so buying one here would count it twice)
        const priced = cfg.features.catalogoDePrecios
        const row = (name: string, weight: number, price: number | null, group?: number): PickerItem =>
          ({ id: name, label: name, weight, ...(priced ? { price, group } : {}) })
        const weapons = catalogWeapons.filter(isPickable)
        const config = {
          weapon: { label: 'Armas',     items: weapons.map((w) => row(w.name, w.weight, w.price, w.weaponTypeId)) },
          armor:  { label: 'Armaduras', items: catalogArmor.filter(isPickable).map((a) => row(a.name, a.weight, a.price)) },
          gear:   { label: 'Equipo',    items: catalogGear.filter(isPickable).map((g) => row(g.name, g.weight, g.price)) },
        }[itemPicker]
        const groups = itemPicker === 'weapon'
          ? [...new Set(weapons.map((w) => w.weaponTypeId))].sort((a, b) => a - b).map((id) => ({ id, label: wtMap.get(id) ?? '—' }))
          : []
        return (
          <ItemPicker
            kind={itemPicker}
            label={config.label}
            items={config.items}
            groups={groups}
            searchable={priced}
            moneda={cfg.moneda}
            onPick={(name) => addItem(itemPicker, name)}
            onClose={() => setItemPicker(null)}
          />
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
                    {[{ label: 'Habilidad', value: skMap.get(weapon.skillId) ?? '—' }, { label: 'Tipo', value: wtMap.get(weapon.weaponTypeId) ?? '—' }, { label: 'Alcance', value: rMap.get(weapon.rangeId) ?? '—' }, { label: 'Peso', value: `${weapon.weight} kg` }, ...priceEraTiles(weapon, cfg)].map(({ label, value }) => (
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
                    {[{ label: 'Tipo', value: atMap.get(armor.armorTypeId) ?? '—' }, { label: 'Peso', value: `${armor.weight} kg` }, ...priceEraTiles(armor, cfg)].map(({ label, value }) => (
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
                    {[{ label: 'Peso', value: `${gear.weight} kg` }, { label: 'Precio', value: formatMoneda(gear.price, cfg.moneda) }, ...eraTiles(gear.era, cfg)].map(({ label, value }) => (
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
