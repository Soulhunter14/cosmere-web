import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Check, Lock, Plus, Zap, Music, ChevronRight, TriangleAlert, CircleX, Sparkles } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { Button, ConfirmDialog, EmptyState, SectionTitle, Sheet, Spinner, TabPanel, Tabs, type TabItem } from '../../components/ui'
import type { Character, UpdateCharacterRequest } from '../../types'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import type { HeroicPathTalento } from '../../data/heroicPaths'
import { RADIANT_ORDERS } from '../../data/radiantOrders'
import { POTENCIAS } from '../../data/potencias'
import type { Talento } from '../../data/potencias'
import {
  ARBOL_CANTOR, CANTOR_COLOR, CAMBIAR_DE_FORMA, FORMA_ACTIVA_PREFIX,
  getFormaActiva, withFormaActiva, getFormasDisponibles,
} from '../../data/cantores'
import type { FormaCantor } from '../../data/cantores'
import { RadiantOrderIcon } from '../../components/RadiantOrderIcon'
import { TalentActivation } from '../../components/TalentActivation'
import type { ActivationType } from '../../components/TalentActivation'
import { CharacterHero } from '../../components/CharacterHero'
import { HeroicPathIcon, SurgeIcon } from '../../components/GameIcons'
import { heroPill, onGem, onGemSoft } from '../../lib/hero'
import { c, eyebrow, font, fs, ink, pill, radius, shadow, tint, titleText, tone } from '../../theme'

// ── Skill map ─────────────────────────────────────────────────────────────

const SKILL_NAME_MAP: Record<string, string> = {
  'Agilidad': 'agilidad', 'Armas Ligeras': 'armasLigeras', 'Armas Pesadas': 'armasPesadas',
  'Atletismo': 'atletismo', 'Hurto': 'hurto', 'Sigilo': 'sigilo',
  'Deducción': 'deduccion', 'Disciplina': 'disciplina', 'Intimidación': 'intimidacion',
  'Manufactura': 'manufactura', 'Medicina': 'medicina', 'Conocimiento': 'conocimiento',
  'Saber': 'conocimiento', 'Engaño': 'engano', 'Liderazgo': 'liderazgo',
  'Percepción': 'percepcion', 'Perspicacia': 'perspicacia',
  'Persuasión': 'persuasion', 'Supervivencia': 'supervivencia',
}

// ── checkPrereq ───────────────────────────────────────────────────────────

function checkPrereq(
  prereq: string | undefined,
  char: Character,
  selected: string[],
  heroicMainTalent: string | undefined,
  radiantMainTalent: string | undefined,
): { met: boolean; missing: string[] } {
  if (!prereq) return { met: true, missing: [] }
  // Dynamic field access (skills and habilidadPersonalizada1..6) by name
  const fields = char as unknown as Record<string, unknown>
  const missing: string[] = []
  const andClauses = prereq.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
  for (const clause of andClauses) {
    const masked = clause.replace(/(\d+) o más/g, '$1__GTE__')
    const orParts = masked.split(/ [ou] /).map((s) => s.trim().replace(/__GTE__/g, ' o más'))
    const clauseMet = orParts.some((part) => {
      if (part.startsWith('tener ')) return true
      const mainMatch = part.match(/^talento principal (.+)$/)
      if (mainMatch) {
        const n = mainMatch[1]
        return heroicMainTalent === n || radiantMainTalent === n || selected.includes(n)
      }
      const talentMatch = part.match(/^talento (.+)$/)
      if (talentMatch) return selected.includes(talentMatch[1])
      const skillMatch = part.match(/^(.+?) (\d+) o más$/)
      if (skillMatch) {
        const skillName = skillMatch[1]
        const minVal = parseInt(skillMatch[2])
        if (skillName === 'nivel') return (char.level ?? 0) >= minVal
        const key = SKILL_NAME_MAP[skillName]
        if (key) return Number(fields[key] ?? 0) >= minVal
        for (let i = 1; i <= 6; i++) {
          if (fields[`habilidadPersonalizada${i}`] === skillName)
            return Number(fields[`habilidadPersonalizada${i}Valor`] ?? 0) >= minVal
        }
        return false
      }
      return selected.includes(part)
    })
    if (!clauseMet) missing.push(clause)
  }
  return { met: missing.length === 0, missing }
}

// ── Node types ────────────────────────────────────────────────────────────

interface TNode {
  name: string
  activation: ActivationType | null
  description: string
  prereq?: string
  source: string
  children: TNode[]
}

type DrawerNode = TNode & {
  state: 'selected' | 'available' | 'locked'
  missing: string[]
  color: string
  isAutoAdded: boolean
  cantorFormas?: FormaCantor[]   // formas que desbloquea este talento de cantor
  isFormaPicker?: boolean        // modo especial: picker de forma activa
}

// ── Tree builders ─────────────────────────────────────────────────────────

/**
 * Finds the best single parent for a node via longest-match on the prereq string.
 *
 * For OR-prereqs like "talento A o talento B" we still pick the longest-matching
 * talent name (A in this case) and let the card's prereq text communicate the
 * alternative path. This keeps OR-prereq nodes at the correct depth in the tree
 * rather than floating them up to root level.
 */
function resolveParent(prereq: string | undefined, fallback: string, names: string[]): string {
  if (!prereq) return fallback
  let best = ''
  for (const n of names) {
    if (prereq.includes(n) && n.length > best.length) best = n
  }
  return best || fallback
}

function buildSpecialtyNodes(
  talentos: readonly HeroicPathTalento[],
  mainTalentName: string,
  source: string,
): TNode[] {
  const names = talentos.map((t) => t.name)
  const nodeMap = new Map<string, TNode>()
  for (const t of talentos)
    nodeMap.set(t.name, { name: t.name, activation: t.activation, description: t.description, prereq: t.prerequisites, source, children: [] })
  const roots: TNode[] = []
  for (const t of talentos) {
    const parentName = resolveParent(t.prerequisites, mainTalentName, names)
    const node = nodeMap.get(t.name)!
    if (parentName === mainTalentName || !nodeMap.has(parentName)) roots.push(node)
    else nodeMap.get(parentName)!.children.push(node)
  }
  return roots
}

function buildOrderNodes(talentos: readonly Talento[], source: string): TNode[] {
  if (!talentos.length) return []
  const names = talentos.map((t) => t.name)
  const nodeMap = new Map<string, TNode>()
  for (const t of talentos)
    nodeMap.set(t.name, { name: t.name, activation: t.cost, description: t.description, prereq: t.prereq, source, children: [] })
  const root = nodeMap.get(talentos[0].name)!
  for (const t of talentos.slice(1)) {
    const parentName = resolveParent(t.prereq, talentos[0].name, names)
    const parentNode = nodeMap.get(parentName) ?? root
    parentNode.children.push(nodeMap.get(t.name)!)
  }
  return [root]
}

function buildPotenciaChildren(talentos: readonly Talento[], potenciaName: string, source: string): TNode[] {
  if (!talentos.length) return []
  const names = talentos.map((t) => t.name)
  const nodeMap = new Map<string, TNode>()
  for (const t of talentos)
    nodeMap.set(t.name, { name: t.name, activation: t.cost, description: t.description, prereq: t.prereq, source, children: [] })
  const roots: TNode[] = []
  for (const t of talentos) {
    const parentName = resolveParent(t.prereq, potenciaName, names)
    const node = nodeMap.get(t.name)!
    if (parentName === potenciaName || !nodeMap.has(parentName)) roots.push(node)
    else nodeMap.get(parentName)!.children.push(node)
  }
  return roots
}

// ── Cantor tree builder ───────────────────────────────────────────────────
//
// Árbol fijo (no auto-generado) porque la topología está bien definida:
//
//              Cambiar de forma
//    ┌──────────────┼───────────────┐
// delicadeza   determinación   sabiduría
//                   │
//           Mente ambiciosa
//        ┌──────────┼──────────┐
//    destrucción  expansión  misterio

function buildCantorTNodes(): TNode[] {
  const byName = new Map(ARBOL_CANTOR.map((t) => [t.nombre, t]))

  const makeNode = (nombre: string, children: TNode[] = []): TNode => {
    const t = byName.get(nombre)!
    return {
      name: t.nombre,
      activation: t.activacion ? (t.activacion as ActivationType) : null,
      description: t.descripcion,
      prereq: t.prereq,
      source: 'Cantor',
      children,
    }
  }

  const poderNodes = ['Formas de destrucción', 'Formas de expansión', 'Formas de misterio'].map((n) => makeNode(n))
  const menteAmbiciosa = makeNode('Mente ambiciosa', poderNodes)
  const formasDet = makeNode('Formas de determinación', [menteAmbiciosa])

  return [
    makeNode(CAMBIAR_DE_FORMA, [
      makeNode('Formas de delicadeza'),
      formasDet,
      makeNode('Formas de sabiduría'),
    ]),
  ]
}

// ── Talentos permitidos por nivel (Manual del Jugador, Cap. 1) ───────────
//
// Tabla Progreso de los personajes:
//   • 1 talento de camino por nivel (niveles 1–20)
//   • Ascendencia inicial: Oyente = 2 (Cambiar de forma + forma inicial), Humano = 1 extra
//   • Talentos de ascendencia extra en niveles 6, 11, 16 y 21
//
function getTalentosPermitidos(level: number, ascendencia: string): number {
  let total = Math.min(level, 20) // 1 talento de camino por nivel hasta 20
  if (level > 20) total += level - 20 // nivel 21+ también da talentos (simplificación conservadora)
  // Ascendencia inicial
  total += ascendencia === 'Oyente' ? 2 : 1
  // Bonus de ascendencia en hitos de rango
  for (const hito of [6, 11, 16, 21]) {
    if (level >= hito) total += 1
  }
  return total
}

// ── Theme-aware accent from a data colour (heroic path, radiant order, cantor) ──
// ink() clamps the data colour to a readable lightness per theme; every tint derives from it,
// so borders and washes stay visible on paper and on ink.

interface Accent {
  /** text / icon colour: ink() nudged towards --text so it stays AA even on its own tinted wash */
  fg: string
  /** the clamped data colour itself (base for tints) */
  ink: string
  /** solid wash of the accent over a surface */
  wash: (pct: number, base?: string) => string
  /** tree connector lines */
  line: string
  /** outline of a learnable node / tinted card */
  border: string
  /** outline of a learned node */
  borderStrong: string
}

function accentOf(color: string): Accent {
  const base = ink(color)
  return {
    fg: `color-mix(in oklab, ${base} 78%, var(--text))`,
    ink: base,
    wash: (pct, surface = c.s1) => `color-mix(in srgb, ${base} ${pct}%, ${surface})`,
    line: tint(base, 38),
    border: tint(base, 48),
    borderStrong: tint(base, 62),
  }
}

/** Pill in an accent colour (text AA on its own tint) */
const accentPill = (a: Accent): CSSProperties => ({
  ...pill({ fg: a.fg, bg: tint(a.ink, 10), border: tint(a.ink, 32) }),
  fontSize: fs.eyebrow,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
})

type SectionKey = 'heroico' | 'radiante' | 'cantor'
const TAB_PREFIX = 'talentos'

/* Text on the CharacterHero gradient (see components/CharacterHero.tsx: ≥ 7:1 on every palette) */
const HERO_TEXT = onGem
const HERO_TEXT_SOFT = onGemSoft
/** 0 below 640px, `px` from 640px (inline styles cannot use media queries) */
const fromTablet = (px: number) => `clamp(0px, calc((100vw - 640px) * 999), ${px}px)`

// ── Local presentational pieces ───────────────────────────────────────────

/** Horizontal scroller for a talent tree: bleeds to the page gutter so wide trees scroll edge to edge.
 *  position:relative makes it the containing block of the absolutely positioned .sr-only labels inside the
 *  cards; without it they escape the clip and widen the whole page on phones.
 *  `center`: single-root pyramids start scrolled to the middle so the root card is fully visible.
 *  The edges fade out only on the side where more of the tree is hidden, as a scroll hint
 *  (the mask uses an opaque token: only its alpha matters). */
const FADE = 28
function TreeScroll({ children, center = false }: { children: ReactNode; center?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })
  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const left = el.scrollLeft > 2
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
    setEdges((p) => (p.left === left && p.right === right ? p : { left, right }))
  }, [])
  useLayoutEffect(() => {
    const el = ref.current
    if (center && el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
    measure()
  }, [center, measure])
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])
  const mask = edges.left || edges.right
    ? `linear-gradient(90deg, ${edges.left ? 'transparent' : 'var(--text)'} 0, var(--text) ${edges.left ? FADE : 0}px, var(--text) calc(100% - ${edges.right ? FADE : 0}px), ${edges.right ? 'transparent' : 'var(--text)'} 100%)`
    : undefined
  return (
    <div
      ref={ref}
      onScroll={measure}
      style={{
        position: 'relative', overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        margin: '0 -16px', padding: '4px 16px 12px',
        WebkitMaskImage: mask, maskImage: mask,
      }}
    >
      <div style={{ minWidth: 'max-content' }}>{children}</div>
    </div>
  )
}

/** "Forma de poder" marker (vacíospren): icon + text for assistive tech when no visible note explains it */
function PoderMark({ size = 14, announce }: { size?: number; announce: boolean }) {
  return (
    <span title="Forma de poder" style={{ display: 'inline-flex', color: tone.heliodoro.fg, flexShrink: 0 }}>
      <Zap size={size} aria-hidden />
      {announce && <span className="sr-only">Forma de poder</span>}
    </span>
  )
}

/** Singer form card used in the picker and in the talent drawer */
function FormaCard({
  forma,
  isActive,
  accent,
  onActivate,
  showPoderNote,
  showAcciones,
}: {
  forma: FormaCantor
  isActive: boolean
  accent: Accent
  onActivate?: () => void
  showPoderNote: boolean
  showAcciones: boolean
}) {
  return (
    <li
      style={{
        listStyle: 'none',
        borderRadius: radius.md,
        border: isActive ? `1.5px solid ${accent.borderStrong}` : `1px solid ${c.border}`,
        background: isActive ? accent.wash(8, c.s2) : c.s2,
        padding: '12px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
          {forma.esPoder && <PoderMark announce={!showPoderNote} />}
          <span style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 650, lineHeight: 1.2, color: isActive ? accent.fg : c.text }}>
            {forma.nombre}
          </span>
          {isActive && (
            <span style={{ ...eyebrow, color: accent.fg, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Check size={13} aria-hidden strokeWidth={2.5} />
              Activa
            </span>
          )}
        </div>
        {onActivate && (
          <Button variant="secondary" size="md" onClick={onActivate} aria-label={`Activar forma ${forma.nombre}`} style={{ flexShrink: 0 }}>
            Activar
          </Button>
        )}
      </div>
      <p style={{ fontSize: fs.sm, color: accent.fg, marginTop: 4 }}>{forma.spren}</p>
      <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 4, lineHeight: 1.5 }}>{forma.bonos}</p>
      {showPoderNote && forma.esPoder && (
        <p style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: fs.sm, color: tone.heliodoro.fg, marginTop: 6, fontStyle: 'italic' }}>
          <TriangleAlert size={14} aria-hidden style={{ marginTop: 2 }} />
          Vacíospren — influencia de Odium
        </p>
      )}
      {showAcciones && forma.accionesEspeciales?.map((a) => (
        <p key={a} style={{ fontSize: fs.sm, color: tone.heliodoro.fg, marginTop: 4, lineHeight: 1.45 }}>{a}</p>
      ))}
    </li>
  )
}

// ── Component ─────────────────────────────────────────────────────────────

export function TalentosDetailPage() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const cId = Number(campaignId)
  const charId = Number(characterId)
  const qc = useQueryClient()
  const [drawerNode, setDrawerNode] = useState<DrawerNode | null>(null)
  const [activeTab, setActiveTab] = useState<SectionKey>('heroico')
  // "Olvidar" asks for confirmation first: it can also remove the talents that depend on this one
  const [forgetConfirm, setForgetConfirm] = useState<{ name: string; afterRemove: string[]; alsoRemoved: string[] } | null>(null)

  const { data: character, isLoading } = useQuery<Character>({
    queryKey: ['character', cId, charId],
    queryFn: () => charactersApi.getById(cId, charId),
  })

  const talentosMutation = useMutation({
    mutationFn: (names: string[]) =>
      charactersApi.update(cId, charId, { ...(character as UpdateCharacterRequest), talentos: JSON.stringify(names) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['character', cId, charId] }),
  })

  // Loading keeps a (visually hidden) h1 so the page is never headless, as in CharacterDetailPage
  if (isLoading || !character) return <><h1 className="sr-only">Talentos</h1><Spinner /></>

  const heroicPath = HEROIC_PATHS.find((p) => p.id === character.caminoHeroico)
  const radiantOrder = RADIANT_ORDERS.find((o) => o.id === character.caminoRadiante)
  const isCantor = character.ascendencia === 'Oyente'

  // Para cantores, "Cambiar de forma" se adquiere automáticamente por ascendencia.
  // Lo inyectamos localmente si aún no está guardado (se guardará al adquirir otro talento).
  const rawTalentos: string[] = (() => {
    try { return JSON.parse(character.talentos || '[]') } catch { return [] }
  })()
  const selectedTalentos: string[] =
    isCantor && !rawTalentos.includes(CAMBIAR_DE_FORMA)
      ? [CAMBIAR_DE_FORMA, ...rawTalentos]
      : rawTalentos

  const autoAdded = new Set<string>([
    ...(heroicPath ? [heroicPath.mainTalent] : []),
    ...(radiantOrder ? [radiantOrder.talentos[0]?.name] : []),
    ...(radiantOrder?.surges ?? []),
    ...(isCantor ? [CAMBIAR_DE_FORMA] : []),
  ])

  const heroicMainTalent = heroicPath?.mainTalent
  const radiantMainTalent = radiantOrder?.talentos[0]?.name

  const allPrereqs = new Map<string, string | undefined>()
  if (heroicPath)
    for (const spec of heroicPath.specialties)
      for (const t of spec.talentos)
        allPrereqs.set(t.name, t.prerequisites)
  if (radiantOrder) {
    for (const t of radiantOrder.talentos) allPrereqs.set(t.name, t.prereq)
    for (const surge of radiantOrder.surges) {
      const pot = POTENCIAS.find((p) => p.name === surge)
      if (pot) for (const t of pot.talentos) allPrereqs.set(t.name, t.prereq)
    }
  }
  if (isCantor)
    for (const t of ARBOL_CANTOR) allPrereqs.set(t.nombre, t.prereq)

  function computeCascadeRemove(name: string): string[] {
    let result = selectedTalentos.filter((n) => n !== name)
    let changed = true
    while (changed) {
      changed = false
      const next = result.filter((n) => {
        if (autoAdded.has(n)) return true
        const prereq = allPrereqs.get(n)
        if (!prereq) return true
        const { met } = checkPrereq(prereq, character!, result, heroicMainTalent, radiantMainTalent)
        return met
      })
      if (next.length !== result.length) { result = next; changed = true }
    }
    return result
  }

  function toDrawerNode(node: TNode, color: string): DrawerNode {
    const isSelected = selectedTalentos.includes(node.name)
    const { met, missing } = isSelected
      ? { met: true, missing: [] }
      : checkPrereq(node.prereq, character!, selectedTalentos, heroicMainTalent, radiantMainTalent)
    const state: 'selected' | 'available' | 'locked' = isSelected ? 'selected' : met ? 'available' : 'locked'
    const cantorTalento = ARBOL_CANTOR.find((t) => t.nombre === node.name)
    const cantorFormas = cantorTalento?.formas.length ? cantorTalento.formas : undefined
    return { ...node, state, missing, color, isAutoAdded: autoAdded.has(node.name), cantorFormas }
  }

  // ── Sections and tabs ───────────────────────────────────────────────────
  // The visible section falls back to the first available one, so a character without a heroic
  // path (radiant + cantor) never lands on an empty panel with no selected tab.

  const sections: TabItem<SectionKey>[] = [
    ...(heroicPath ? [{
      id: 'heroico' as const,
      label: <><span className="hide-mobile" style={{ lineHeight: 0 }}><HeroicPathIcon id={heroicPath.id} size={16} /></span>{heroicPath.name}</>,
    }] : []),
    ...(radiantOrder ? [{
      id: 'radiante' as const,
      label: <><span className="hide-mobile" style={{ lineHeight: 0 }}><RadiantOrderIcon orderId={radiantOrder.id} size={18} decorative /></span>{radiantOrder.name}</>,
    }] : []),
    ...(isCantor ? [{
      id: 'cantor' as const,
      label: <><span className="hide-mobile" style={{ lineHeight: 0 }}><Music size={15} aria-hidden /></span>Cantor</>,
    }] : []),
  ]
  const showTabs = sections.length >= 2
  const currentTab: SectionKey | undefined = sections.some((s) => s.id === activeTab) ? activeTab : sections[0]?.id

  const panel = (id: SectionKey, content: ReactNode) =>
    showTabs ? <TabPanel key={id} idPrefix={TAB_PREFIX} id={id}>{content}</TabPanel> : <div key={id}>{content}</div>

  // ── Section header (book style: small caps + gold rule) ─────────────────

  function renderSectionHeader(label: ReactNode, icon?: ReactNode, topSpacing = 32) {
    return (
      <SectionTitle style={{ marginTop: topSpacing, marginBottom: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          {icon}
          {label}
        </span>
      </SectionTitle>
    )
  }

  /** Staggered entrance for each section block */
  const rise = (i: number) => ({ className: 'rise', style: { '--i': i } as CSSProperties })

  // ── Pyramid tree renderer ───────────────────────────────────────────────
  //
  // True top-down org-chart layout. Each node:
  //   1. Renders its compact card, centered within its allocated column.
  //   2. Draws a short vertical stem downward.
  //   3. Spreads children in a horizontal flex row, each child getting flex:1.
  //
  // The horizontal bar is drawn using the "half-border" trick — no pseudo-
  // elements needed, works with inline styles:
  //
  //   Each child column renders:
  //     • left half  of the bar (position:absolute left:0  width:50%)  — unless first child
  //     • right half of the bar (position:absolute right:0 width:50%) — unless last child
  //   Adjacent halves from neighbouring children join to form a solid bar that
  //   goes exactly from center-of-first-child to center-of-last-child.
  //
  //          [Parent]
  //              │           ← vertical stem
  //      ┌───────┼───────┐   ← left half + right half meeting at each center
  //      │       │       │   ← vertical drops
  //  [Child A] [Child B] [Child C]
  //
  // OR-prereq nodes (multi-parent) are placed at root level by resolveParent
  // so their full prereq text is always visible (no false parent implied).

  function renderNode(node: TNode, color: string): ReactElement {
    const dn = toDrawerNode(node, color)
    const { state } = dn
    const a = accentOf(color)
    const lineColor = a.line

    // State is carried by shape + icon + text, not by colour alone:
    // learned = solid tinted card + check · learnable = dashed outline · locked = recessed + lock + "Bloqueado"
    const cardState: CSSProperties =
      state === 'selected' ? { border: `1.5px solid ${a.borderStrong}`, background: a.wash(12), boxShadow: shadow[1] }
      : state === 'available' ? { border: `1.5px dashed ${a.border}`, background: c.s1, boxShadow: shadow[1] }
      : { border: `1px solid ${c.border}`, background: c.s2 }

    const nameColor =
      state === 'selected' ? a.fg
      : state === 'available' ? c.text
      : c.muted

    return (
      <div key={node.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

        {/* ── Compact card ────────────────────────────────────────────── */}
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setDrawerNode(dn)}
          className="ui-btn"
          style={{
            display: 'inline-flex', flexDirection: 'column', gap: 6,
            padding: '10px 12px', borderRadius: radius.sm,
            ...cardState,
            cursor: 'pointer', textAlign: 'left', color: c.text,
            minWidth: 100, maxWidth: 185, minHeight: 44,
          }}
        >
          {/* Activation icon + name */}
          <span style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            {node.activation && (
              <span style={{ flexShrink: 0, marginTop: 1 }}>
                <TalentActivation type={node.activation} compact />
              </span>
            )}
            {state === 'selected' && (
              <Check size={15} aria-hidden strokeWidth={2.75} style={{ color: a.fg, flexShrink: 0, marginTop: 3 }} />
            )}
            <span style={{ fontFamily: font.display, fontSize: fs.md, fontWeight: 650, color: nameColor, lineHeight: 1.2 }}>
              {node.name}
              {state === 'selected' && <span className="sr-only">, aprendido</span>}
              {state === 'available' && <span className="sr-only">, disponible</span>}
            </span>
          </span>

          {/* Prereq text — only when NOT acquired */}
          {state !== 'selected' && node.prereq && (
            <span style={{ fontSize: fs.xs, fontStyle: 'italic', lineHeight: 1.35, color: state === 'locked' ? c.subtle : c.muted }}>
              {node.prereq}
            </span>
          )}

          {/* Lock chip */}
          {state === 'locked' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: c.subtle }}>
              <Lock size={12} aria-hidden />
              <span style={{ fontSize: fs.xs, fontWeight: 600 }}>Bloqueado</span>
            </span>
          )}
        </button>

        {/* ── Children connector ──────────────────────────────────────── */}
        {node.children.length > 0 && (
          <>
            {/* Vertical stem from card down to children bar */}
            <div aria-hidden style={{ width: 2, height: 16, background: lineColor, flexShrink: 0 }} />

            {/* Children row — each child gets flex:1 (equal horizontal space).
                Gap of 10px between columns; bars extend 5px into the gap on each
                side so the horizontal connector remains continuous box-to-box.    */}
            <div style={{ display: 'flex', width: '100%', gap: 10 }}>
              {node.children.map((child, i) => {
                const isFirst = i === 0
                const isLast = i === node.children.length - 1

                return (
                  <div
                    key={child.name}
                    style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    {/* Left half — extends 5 px into the gap to meet the neighbour's right half */}
                    {!isFirst && (
                      <div aria-hidden style={{ position: 'absolute', top: 0, left: -5, width: 'calc(50% + 5px)', height: 2, background: lineColor }} />
                    )}

                    {/* Right half — extends 5 px into the gap */}
                    {!isLast && (
                      <div aria-hidden style={{ position: 'absolute', top: 0, right: -5, width: 'calc(50% + 5px)', height: 2, background: lineColor }} />
                    )}

                    {/* Vertical drop from bar top down to child card */}
                    <div aria-hidden style={{ width: 2, height: 14, background: lineColor, flexShrink: 0 }} />

                    {renderNode(child, color)}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Helper: render a forest of roots as equally-spaced columns ──────────
  // Each root gets equal horizontal space (flex: 1) so the half-border trick
  // works correctly. The container is centered; on wide viewports the tree
  // sits in the middle rather than stretching wall-to-wall.

  function renderForest(roots: TNode[], color: string) {
    // Give each subtree a sensible base width so cards aren't too thin
    const minColW = 160
    const totalW = roots.length * minColW
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', minWidth: totalW, width: '100%', maxWidth: 700 }}>
          {roots.map((node) => (
            <div key={node.name} style={{ flex: 1 }}>
              {renderNode(node, color)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Talent excess (talentos que no consumen slot no cuentan) ────────────
  //   • Talento principal del camino heroico
  //   • Todos los ideales Radiantes (Primer → Cuarto Ideal)
  //   • Nombres de potencias / surges (se añaden automáticamente al elegir la Orden)
  const talentosLibres = new Set<string>([
    ...(heroicPath ? [heroicPath.mainTalent] : []),
    ...(radiantOrder?.talentos.map((t) => t.name) ?? []),
    ...(radiantOrder?.surges ?? []),
  ])
  const counted = selectedTalentos.filter(
    (t) => !t.startsWith(FORMA_ACTIVA_PREFIX) && !talentosLibres.has(t),
  )
  const permitidos = getTalentosPermitidos(character.level, character.ascendencia)
  const exceso = counted.length - permitidos

  // ── Drawer (talent detail / singer form picker) ─────────────────────────

  function renderDrawer(dn: DrawerNode) {
    const a = accentOf(dn.color)
    const close = () => setDrawerNode(null)

    // Forget plan: the talent plus every dependent that would lose its prerequisites
    const forgetPlan = !dn.isFormaPicker && !dn.isAutoAdded && dn.state === 'selected'
      ? (() => {
          const afterRemove = computeCascadeRemove(dn.name)
          const alsoRemoved = selectedTalentos
            .filter((n) => !n.startsWith(FORMA_ACTIVA_PREFIX))
            .filter((n) => n !== dn.name && !afterRemove.includes(n))
          return { afterRemove, alsoRemoved }
        })()
      : null

    let action: ReactNode = null
    if (!dn.isFormaPicker && !dn.isAutoAdded) {
      if (forgetPlan) {
        action = (
          <Button
            variant="danger"
            size="lg"
            icon={<X size={16} aria-hidden />}
            onClick={() => setForgetConfirm({ name: dn.name, ...forgetPlan })}
            aria-haspopup="dialog"
            style={{ flex: 1 }}
          >
            {forgetPlan.alsoRemoved.length > 0 ? `Olvidar ${1 + forgetPlan.alsoRemoved.length} talentos` : 'Olvidar talento'}
          </Button>
        )
      } else if (dn.state === 'available') {
        action = (
          <Button
            variant="primary"
            size="lg"
            icon={<Plus size={16} aria-hidden />}
            onClick={() => { talentosMutation.mutate([...selectedTalentos, dn.name]); setDrawerNode(null) }}
            style={{ flex: 1 }}
          >
            Aprender talento
          </Button>
        )
      } else {
        action = (
          <div
            style={{
              flex: 1, minHeight: 50, padding: '8px 14px', borderRadius: radius.md,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: c.s2, border: `1px dashed ${c.borderBright}`,
              color: c.muted, fontSize: fs.sm, fontWeight: 600, textAlign: 'center',
            }}
          >
            <Lock size={16} aria-hidden style={{ flexShrink: 0 }} />
            Prerrequisitos no cumplidos
          </div>
        )
      }
    }

    const footer = (
      <>
        <Button variant="secondary" size="lg" onClick={close} data-autofocus style={{ flex: action ? '0 0 auto' : 1 }}>
          Cerrar
        </Button>
        {action}
      </>
    )

    // ── Modo picker de forma activa ──────────────────────────────────────
    if (dn.isFormaPicker) {
      return (
        <Sheet
          open
          onClose={close}
          title="Seleccionar forma activa"
          description="Solo puedes estar en una forma a la vez. El cambio ocurre durante una alta tormenta."
          footer={footer}
        >
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dn.cantorFormas?.map((forma) => {
              const isActive = getFormaActiva(selectedTalentos) === forma.nombre
              return (
                <FormaCard
                  key={forma.nombre}
                  forma={forma}
                  isActive={isActive}
                  accent={a}
                  showPoderNote
                  showAcciones={false}
                  onActivate={!isActive ? () => { talentosMutation.mutate(withFormaActiva(selectedTalentos, forma.nombre)); setDrawerNode(null) } : undefined}
                />
              )
            })}
          </ul>
        </Sheet>
      )
    }

    // ── Modo normal del drawer ───────────────────────────────────────────
    return (
      <Sheet
        open
        onClose={close}
        title={<span style={{ fontFamily: font.display, color: dn.state === 'selected' ? a.fg : c.text }}>{dn.name}</span>}
        footer={footer}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(dn.activation || dn.source) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {dn.activation && <TalentActivation type={dn.activation} />}
              {dn.source && (
                <span style={accentPill(a)}>
                  {dn.source}
                </span>
              )}
            </div>
          )}

          {dn.prereq && (
            <div style={{ padding: '12px 16px', borderRadius: radius.sm, background: c.s2, border: `1px solid ${c.border}` }}>
              <p style={eyebrow}>Prerrequisito</p>
              <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 4, lineHeight: 1.45 }}>
                {dn.prereq}
                {dn.state === 'selected' && (
                  <span style={{ display: 'inline-flex', verticalAlign: 'middle', color: a.fg, marginLeft: 6 }}>
                    <Check size={14} aria-hidden strokeWidth={2.75} />
                    <span className="sr-only">(cumplido)</span>
                  </span>
                )}
              </p>
              {dn.state === 'locked' && dn.missing.length > 0 && (
                <p style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: fs.sm, fontWeight: 600, color: tone.topacio.fg, marginTop: 6, lineHeight: 1.45 }}>
                  <CircleX size={14} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Falta: {dn.missing.join(', ')}</span>
                </p>
              )}
            </div>
          )}

          <p style={{ fontFamily: font.display, fontSize: fs.md + 1, color: c.text, lineHeight: 1.55, whiteSpace: 'pre-line' }}>
            {dn.description}
          </p>

          {/* Formas que desbloquea este talento de cantor */}
          {dn.cantorFormas && dn.cantorFormas.length > 0 && (
            <div>
              <h3 style={{ ...eyebrow, fontFamily: font.ui, marginBottom: 8 }}>
                Formas {dn.state === 'selected' ? 'desbloqueadas' : 'que obtendrás'}
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dn.cantorFormas.map((forma) => {
                  const isActive = getFormaActiva(selectedTalentos) === forma.nombre
                  return (
                    <FormaCard
                      key={forma.nombre}
                      forma={forma}
                      isActive={isActive}
                      accent={a}
                      showPoderNote={false}
                      showAcciones
                      onActivate={dn.state === 'selected' && !isActive
                        ? () => { talentosMutation.mutate(withFormaActiva(selectedTalentos, forma.nombre)); setDrawerNode(null) }
                        : undefined}
                    />
                  )
                })}
              </ul>
            </div>
          )}

          {forgetPlan && forgetPlan.alsoRemoved.length > 0 && (
            <div style={{ padding: '12px 16px', borderRadius: radius.sm, background: tone.rubi.bg, border: `1px solid ${tone.rubi.border}` }}>
              <p style={{ ...eyebrow, color: tone.rubi.fg }}>También se olvidarán</p>
              <ul style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {forgetPlan.alsoRemoved.map((n) => (
                  <li key={n} style={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: fs.sm, color: c.text, lineHeight: 1.35 }}>
                    <span aria-hidden style={{ width: 5, height: 5, borderRadius: '50%', background: tone.rubi.fg, flexShrink: 0 }} />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Sheet>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const forgetCount = forgetConfirm ? 1 + forgetConfirm.alsoRemoved.length : 0

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* ── Hero header — scrolls with the page ──────────────────────────── */}
      {/* Same framing as the ficha and metas heroes: full-bleed on phones, a rounded card from 640px */}
      <CharacterHero
        characterId={character.id}
        style={{ borderRadius: fromTablet(radius.lg), marginTop: fromTablet(16), borderBottom: 'none' }}
      >
        <p style={{ ...eyebrow, color: HERO_TEXT_SOFT, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Sparkles size={14} aria-hidden />
          Talentos
        </p>
        <h1 style={{ ...titleText, fontSize: fs['2xl'], color: HERO_TEXT, marginBottom: 14, overflowWrap: 'anywhere' }}>
          {character.name}
        </h1>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ ...heroPill, fontVariantNumeric: 'tabular-nums' }}>Nv. {character.level}</span>
          {heroicPath && (
            <span style={heroPill}>
              <HeroicPathIcon id={heroicPath.id} size={13} />
              {heroicPath.name}
            </span>
          )}
          {radiantOrder && (
            <span style={{ ...heroPill, paddingLeft: 4 }}>
              <RadiantOrderIcon orderId={radiantOrder.id} size={16} decorative />
              {radiantOrder.name}
            </span>
          )}
        </div>
      </CharacterHero>

      {/* ── Tab bar — sticky under the mobile top bar; only with 2+ sections ── */}
      {showTabs && currentTab && (
        <div className="sticky-under-topbar glass" style={{ padding: '8px 16px', borderBottom: `1px solid ${c.border}` }}>
          <Tabs<SectionKey>
            tabs={sections}
            value={currentTab}
            onChange={setActiveTab}
            ariaLabel="Árboles de talentos"
            idPrefix={TAB_PREFIX}
            stretch
          />
        </div>
      )}

      {/* ── Tree content ─────────────────────────────────────────────────
          Padding and static cards (main talent, section headers) live in
          normal block flow — no overflow context that could clip them.
          Only the individual tree diagrams get their own overflowX:auto
          wrapper so they can scroll horizontally on narrow screens without
          affecting anything above or below them.                          */}
      <div style={{ padding: '20px 16px 56px' }}>

        {!heroicPath && !radiantOrder && !isCantor && (
          <EmptyState
            icon={<Sparkles size={24} aria-hidden />}
            title="Sin camino asignado"
            description="Asigna un Camino Heroico u Orden Radiante en la ficha para ver los talentos disponibles."
          />
        )}

        {/* ── Warning exceso de talentos ──────────────────────────────── */}
        {exceso > 0 && (
          <div
            role="status"
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              background: tone.topacio.bg, border: `1px solid ${tone.topacio.border}`,
              borderRadius: radius.md, padding: '12px 16px', marginBottom: 20,
            }}
          >
            <TriangleAlert size={20} aria-hidden style={{ color: tone.topacio.fg, flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: fs.sm + 1, fontWeight: 700, color: tone.topacio.fg, marginBottom: 2 }}>
                Exceso de talentos
              </p>
              <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>
                {counted.length} talentos seleccionados, pero a nivel {character.level} solo corresponden {permitidos}.
                {' '}Retira {exceso} talento{exceso > 1 ? 's' : ''} para estar dentro del límite.
              </p>
            </div>
          </div>
        )}

        {/* ── Camino Heroico ──────────────────────────────────────────── */}
        {heroicPath && currentTab === 'heroico' && (() => {
          const color = heroicPath.color
          const a = accentOf(color)
          return panel('heroico', (
            <>
              {/* Main talent — highlighted card (not clickable: it is granted by the path) */}
              <section
                aria-labelledby="talento-principal"
                className="rise"
                style={{
                  '--i': 0,
                  background: a.wash(8), border: `1px solid ${a.border}`,
                  borderRadius: radius.lg, padding: '16px 20px', boxShadow: shadow[1],
                } as CSSProperties}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={accentPill(a)}>
                    <HeroicPathIcon id={heroicPath.id} size={13} />
                    {heroicPath.name}
                  </span>
                  <span style={eyebrow}>Talento principal</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <Check size={18} aria-hidden strokeWidth={2.75} style={{ color: a.fg, flexShrink: 0 }} />
                  <h2 id="talento-principal" style={{ fontFamily: font.display, fontSize: fs.xl - 2, fontWeight: 650, color: a.fg, lineHeight: 1.2 }}>
                    {heroicPath.mainTalent}
                  </h2>
                  {heroicPath.mainTalentActivation && <TalentActivation type={heroicPath.mainTalentActivation} compact />}
                </div>
                <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6 }}>
                  {heroicPath.mainTalentEffect}
                </p>
              </section>

              {/* Specialty trees — each scrolls horizontally on its own */}
              {heroicPath.specialties.map((spec, i) => {
                const roots = buildSpecialtyNodes(spec.talentos, heroicPath.mainTalent, spec.name)
                return (
                  <section key={spec.name} {...rise(i + 1)}>
                    {renderSectionHeader(spec.name)}
                    <TreeScroll center={roots.length === 1}>
                      {renderForest(roots, color)}
                    </TreeScroll>
                  </section>
                )
              })}
            </>
          ))
        })()}

        {/* ── Orden Radiante ──────────────────────────────────────────── */}
        {radiantOrder && currentTab === 'radiante' && (() => {
          const color = radiantOrder.color
          const a = accentOf(color)
          return panel('radiante', (
            <>
              <section {...rise(0)}>
                {renderSectionHeader(radiantOrder.name, <RadiantOrderIcon orderId={radiantOrder.id} size={28} decorative />, 4)}
                <TreeScroll center>
                  {renderForest(buildOrderNodes(radiantOrder.talentos, radiantOrder.name), color)}
                </TreeScroll>
              </section>

              {radiantOrder.surges.map((surgeName, i) => {
                const potencia = POTENCIAS.find((p) => p.name === surgeName)
                if (!potencia) return null
                const potNode: TNode = {
                  name: potencia.name,
                  activation: potencia.costoBase,
                  description: potencia.descripcion,
                  source: radiantOrder.name,
                  children: buildPotenciaChildren(potencia.talentos, potencia.name, potencia.name),
                }
                return (
                  <section key={surgeName} {...rise(i + 1)}>
                    {renderSectionHeader(surgeName, <SurgeIcon surge={surgeName} size={22} style={{ color: a.fg }} />)}
                    <TreeScroll center>
                      {renderForest([potNode], color)}
                    </TreeScroll>
                  </section>
                )
              })}
            </>
          ))
        })()}

        {/* ── Cantor / Oyente ─────────────────────────────────────────── */}
        {isCantor && currentTab === 'cantor' && (() => {
          const color = CANTOR_COLOR
          const a = accentOf(color)
          const formaActiva = getFormaActiva(selectedTalentos)
          const formasDisponibles = getFormasDisponibles(selectedTalentos)
          const formaActivaData = formasDisponibles.find((f) => f.nombre === formaActiva)

          const openFormaPicker = () => {
            setDrawerNode({
              name: 'Cambiar forma activa',
              activation: null,
              description: 'Elige la forma de cantor que adoptarás en la próxima alta tormenta.',
              source: 'Cantor',
              prereq: undefined,
              children: [],
              state: 'available',
              missing: [],
              color,
              isAutoAdded: false,
              isFormaPicker: true,
              cantorFormas: formasDisponibles,
            })
          }

          return panel('cantor', (
            <>
              {/* Forma activa card */}
              <section
                aria-labelledby="forma-activa"
                className="rise"
                style={{
                  '--i': 0,
                  background: a.wash(8), border: `1px solid ${a.border}`,
                  borderRadius: radius.lg, padding: '16px 20px', boxShadow: shadow[1],
                } as CSSProperties}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <h2 id="forma-activa" style={{ ...eyebrow, fontFamily: font.ui, color: a.fg, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Music size={14} aria-hidden />
                    Forma activa
                  </h2>
                  <Button variant="secondary" size="md" onClick={openFormaPicker} aria-label="Cambiar forma activa" aria-haspopup="dialog">
                    Cambiar
                    <ChevronRight size={16} aria-hidden style={{ marginRight: -4 }} />
                  </Button>
                </div>
                {formaActiva ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {formaActivaData?.esPoder && <PoderMark size={16} announce={false} />}
                      <p style={{ fontFamily: font.display, fontSize: fs.xl - 2, fontWeight: 650, lineHeight: 1.2, color: a.fg }}>{formaActiva}</p>
                    </div>
                    {formaActivaData && (
                      <>
                        <p style={{ fontSize: fs.sm, color: a.fg, marginTop: 4 }}>
                          {formaActivaData.spren}
                        </p>
                        <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 6, lineHeight: 1.5 }}>
                          {formaActivaData.bonos}
                        </p>
                        {formaActivaData.esPoder && (
                          <p style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: fs.sm, color: tone.heliodoro.fg, marginTop: 8, fontStyle: 'italic' }}>
                            <TriangleAlert size={14} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
                            Forma de poder — riesgo de influencia de Odium
                          </p>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: fs.sm, color: c.muted, fontStyle: 'italic' }}>
                    Sin forma activa. Toca "Cambiar" para seleccionar una.
                  </p>
                )}
              </section>

              {/* Árbol de talentos de cantor */}
              <section {...rise(1)}>
                {renderSectionHeader('Talentos de cantor')}
                <TreeScroll center>
                  {renderForest(buildCantorTNodes(), color)}
                </TreeScroll>
              </section>
            </>
          ))
        })()}

      </div>{/* end tree content */}

      {/* ── Talent drawer ──────────────────────────────────────────────── */}
      {drawerNode && renderDrawer(drawerNode)}

      {/* ── Confirm: forget talent (and cascaded dependents) ───────────── */}
      <ConfirmDialog
        open={!!forgetConfirm}
        title={forgetCount > 1 ? `¿Olvidar ${forgetCount} talentos?` : '¿Olvidar este talento?'}
        message={forgetConfirm
          ? forgetCount > 1
            ? `Se olvidará «${forgetConfirm.name}» y también ${forgetCount - 1} talento${forgetCount - 1 > 1 ? 's que dependen' : ' que depende'} de él: ${forgetConfirm.alsoRemoved.join(', ')}.`
            : `Se olvidará «${forgetConfirm.name}».`
          : undefined}
        confirmLabel={forgetCount > 1 ? `Olvidar ${forgetCount} talentos` : 'Olvidar talento'}
        onConfirm={() => {
          if (forgetConfirm) talentosMutation.mutate(forgetConfirm.afterRemove)
          setForgetConfirm(null)
          setDrawerNode(null)
        }}
        onCancel={() => setForgetConfirm(null)}
      />
    </div>
  )
}
