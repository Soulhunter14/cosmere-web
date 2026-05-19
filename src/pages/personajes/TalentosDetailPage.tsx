import { useState, type ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Check, Lock, Plus, Zap } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { Spinner } from '../../components/ui'
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
        if (key) return ((char as any)[key] ?? 0) >= minVal
        for (let i = 1; i <= 6; i++) {
          if ((char as any)[`habilidadPersonalizada${i}`] === skillName)
            return ((char as any)[`habilidadPersonalizada${i}Valor`] ?? 0) >= minVal
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

// ── Color helper ──────────────────────────────────────────────────────────

function alpha(hex: string, a: number): string {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

// ── Avatar gradients ──────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#7c3aed,#6366f1)',
  'linear-gradient(135deg,#0e7490,#0284c7)',
  'linear-gradient(135deg,#9d174d,#be185d)',
  'linear-gradient(135deg,#065f46,#0d9488)',
  'linear-gradient(135deg,#92400e,#b45309)',
  'linear-gradient(135deg,#4c1d95,#7c3aed)',
]

// ── Component ─────────────────────────────────────────────────────────────

export function TalentosDetailPage() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const cId = Number(campaignId)
  const charId = Number(characterId)
  const qc = useQueryClient()
  const [drawerNode, setDrawerNode] = useState<DrawerNode | null>(null)
  const [activeTab, setActiveTab] = useState<'heroico' | 'radiante' | 'cantor'>('heroico')

  const { data: character, isLoading } = useQuery<Character>({
    queryKey: ['character', cId, charId],
    queryFn: () => charactersApi.getById(cId, charId),
  })

  const talentosMutation = useMutation({
    mutationFn: (names: string[]) =>
      charactersApi.update(cId, charId, { ...(character as UpdateCharacterRequest), talentos: JSON.stringify(names) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['character', cId, charId] }),
  })

  if (isLoading || !character) return <Spinner />

  const gradient = AVATAR_GRADIENTS[character.id % AVATAR_GRADIENTS.length]
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

  // ── Specialty section header ────────────────────────────────────────────

  function renderSpecialtyHeader(label: string, color: string, topSpacing = 20) {
    return (
      <div style={{ marginTop: topSpacing, marginBottom: 14, padding: '5px 12px', background: alpha(color, 0.12), borderLeft: `3px solid ${color}`, borderRadius: '0 6px 6px 0' }}>
        <span style={{ fontSize: 10, fontWeight: 800, color, letterSpacing: '0.12em' }}>
          {label.toUpperCase()}
        </span>
      </div>
    )
  }

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
    const lineColor = alpha(color, 0.3)

    const cardBorder =
      state === 'selected' ? `1.5px solid ${alpha(color, 0.6)}`
      : state === 'available' ? `1.5px dashed ${alpha(color, 0.45)}`
      : '1.5px solid var(--border)'

    const cardBg =
      state === 'selected' ? alpha(color, 0.14)
      : state === 'available' ? alpha(color, 0.04)
      : 'var(--surface-1)'

    const nameColor =
      state === 'selected' ? color
      : state === 'available' ? 'var(--text)'
      : 'var(--text-subtle)'

    return (
      <div key={node.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

        {/* ── Compact card ────────────────────────────────────────────── */}
        <button
          onClick={() => setDrawerNode(dn)}
          style={{
            display: 'inline-flex', flexDirection: 'column', gap: 5,
            padding: '10px 12px', borderRadius: 10,
            border: cardBorder, background: cardBg,
            opacity: state === 'locked' ? 0.45 : 1,
            transition: 'opacity 0.15s',
            cursor: 'pointer', textAlign: 'left',
            minWidth: 100, maxWidth: 185,
          }}
        >
          {/* Activation icon + name */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            {node.activation && (
              <span style={{ flexShrink: 0, marginTop: 1 }}>
                <TalentActivation type={node.activation} compact />
              </span>
            )}
            <span style={{ fontSize: 12, fontWeight: 700, color: nameColor, lineHeight: 1.3 }}>
              {node.name}
            </span>
          </div>

          {/* Prereq text — only when NOT acquired */}
          {state !== 'selected' && node.prereq && (
            <span style={{ fontSize: 10, fontStyle: 'italic', lineHeight: 1.3, color: state === 'locked' ? 'var(--text-subtle)' : alpha(color, 0.7) }}>
              {node.prereq}
            </span>
          )}

          {/* Lock chip */}
          {state === 'locked' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Lock size={9} style={{ color: 'var(--text-subtle)' }} />
              <span style={{ fontSize: 9, color: 'var(--text-subtle)', fontWeight: 600 }}>Bloqueado</span>
            </div>
          )}
        </button>

        {/* ── Children connector ──────────────────────────────────────── */}
        {node.children.length > 0 && (
          <>
            {/* Vertical stem from card down to children bar */}
            <div style={{ width: 2, height: 16, background: lineColor, flexShrink: 0 }} />

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
                      <div style={{ position: 'absolute', top: 0, left: -5, width: 'calc(50% + 5px)', height: 2, background: lineColor }} />
                    )}

                    {/* Right half — extends 5 px into the gap */}
                    {!isLast && (
                      <div style={{ position: 'absolute', top: 0, right: -5, width: 'calc(50% + 5px)', height: 2, background: lineColor }} />
                    )}

                    {/* Vertical drop from bar top down to child card */}
                    <div style={{ width: 2, height: 14, background: lineColor, flexShrink: 0 }} />

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

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* ── Hero header — scrolls with the page ──────────────────────────── */}
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
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4, margin: 0 }}>Talentos</p>
        </div>
      </div>

      {/* ── Tab bar — sticky: se ancla cuando el header sube ─────────────────
          Se muestra cuando hay 2 o más secciones disponibles.             */}
      {(() => {
        const tabs = [
          ...(heroicPath  ? [{ key: 'heroico'  as const, label: `${heroicPath.icon} ${heroicPath.name}`, color: heroicPath.color }]  : []),
          ...(radiantOrder ? [{ key: 'radiante' as const, label: radiantOrder.name,                       color: radiantOrder.color }] : []),
          ...(isCantor     ? [{ key: 'cantor'   as const, label: '🎵 Cantor',                              color: CANTOR_COLOR }]       : []),
        ]
        if (tabs.length < 2) return null
        return (
          <div style={{ position: 'sticky', top: 52, zIndex: 20, display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface-1)' }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{ flex: 1, padding: '10px 8px', fontSize: 12, fontWeight: 600, color: activeTab === t.key ? t.color : 'var(--text-subtle)', background: 'none', border: 'none', borderBottom: activeTab === t.key ? `2px solid ${t.color}` : '2px solid transparent', cursor: 'pointer', transition: 'color 0.15s', letterSpacing: '0.01em' }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )
      })()}

      {/* ── Tree content — horizontally scrollable, tree centered ─────────
          overflowX: auto lets the pyramid scroll sideways on narrow screens
          instead of cramping the cards. The inner div centres content that
          is narrower than the viewport.                                     */}
      {/* ── Tree content ─────────────────────────────────────────────────
          Padding and static cards (main talent, section headers) live in
          normal block flow — no overflow context that could clip them.
          Only the individual tree diagrams get their own overflowX:auto
          wrapper so they can scroll horizontally on narrow screens without
          affecting anything above or below them.                          */}
      <div style={{ padding: '20px 16px 56px' }}>

        {!heroicPath && !radiantOrder && !isCantor && (
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-subtle)', lineHeight: 1.5 }}>
              Asigna un Camino Heroico u Orden Radiante en la ficha para ver los talentos disponibles.
            </p>
          </div>
        )}

        {/* ── Warning exceso de talentos ──────────────────────────────── */}
        {(() => {
          // Talentos que no consumen slot (regalados por el GM o automáticos):
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
          if (exceso <= 0) return null
          return (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.35)',
              borderRadius: 12, padding: '10px 14px', marginBottom: 16,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 2 }}>
                  Exceso de talentos
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-subtle)', lineHeight: 1.4 }}>
                  {counted.length} talentos seleccionados, pero a nivel {character.level} solo corresponden {permitidos}.
                  {' '}Retira {exceso} talento{exceso > 1 ? 's' : ''} para estar dentro del límite.
                </div>
              </div>
            </div>
          )
        })()}

        {/* ── Camino Heroico ──────────────────────────────────────────── */}
        {heroicPath && (activeTab === 'heroico' || (!radiantOrder && !isCantor)) && (() => {
          const color = heroicPath.color
          return (
            <div>
              {/* Main talent — hero card, original design */}
              <div style={{ background: alpha(color, 0.1), border: `1.5px solid ${alpha(color, 0.35)}`, borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 20, background: alpha(color, 0.18), border: `1px solid ${alpha(color, 0.35)}`, color }}>
                    {heroicPath.icon} {heroicPath.name.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em' }}>TALENTO PRINCIPAL</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Check size={14} style={{ color, flexShrink: 0 }} />
                  <span style={{ fontSize: 15, fontWeight: 800, color }}>{heroicPath.mainTalent}</span>
                  {heroicPath.mainTalentActivation && <TalentActivation type={heroicPath.mainTalentActivation} compact />}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                  {heroicPath.mainTalentEffect}
                </p>
              </div>

              {/* Specialty trees — each scrolls horizontally on its own */}
              {heroicPath.specialties.map((spec) => (
                <div key={spec.name}>
                  {renderSpecialtyHeader(spec.name, color)}
                  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
                    <div style={{ minWidth: 'max-content' }}>
                      {renderForest(buildSpecialtyNodes(spec.talentos, heroicPath.mainTalent, spec.name), color)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        })()}

        {/* ── Orden Radiante ──────────────────────────────────────────── */}
        {radiantOrder && (activeTab === 'radiante' || (!heroicPath && !isCantor)) && (() => {
          const color = radiantOrder.color
          return (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <RadiantOrderIcon orderId={radiantOrder.id} size={16} />
                <span style={{ fontSize: 13, fontWeight: 800, color }}>{radiantOrder.name}</span>
                <div style={{ flex: 1, height: 1, background: alpha(color, 0.25) }} />
              </div>

              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
                <div style={{ minWidth: 'max-content' }}>
                  {renderForest(buildOrderNodes(radiantOrder.talentos, radiantOrder.name), color)}
                </div>
              </div>

              {radiantOrder.surges.map((surgeName) => {
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
                  <div key={surgeName}>
                    {renderSpecialtyHeader(surgeName, color)}
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
                      <div style={{ minWidth: 'max-content' }}>
                        {renderForest([potNode], color)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
        {/* ── Cantor / Oyente ─────────────────────────────────────────── */}
        {isCantor && (activeTab === 'cantor' || (!heroicPath && !radiantOrder)) && (() => {
          const color = CANTOR_COLOR
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

          return (
            <div>
              {/* Forma activa card */}
              <div style={{ background: alpha(color, 0.08), border: `1.5px solid ${alpha(color, 0.3)}`, borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: formaActiva ? 8 : 0 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color, textTransform: 'uppercase' }}>
                    🎵 Forma activa
                  </span>
                  <button
                    onClick={openFormaPicker}
                    style={{ fontSize: 10, fontWeight: 700, color, background: alpha(color, 0.12), border: `1px solid ${alpha(color, 0.3)}`, borderRadius: 20, padding: '3px 10px', cursor: 'pointer' }}
                  >
                    Cambiar ▶
                  </button>
                </div>
                {formaActiva ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {formaActivaData?.esPoder && <Zap size={13} style={{ color: '#fb923c', flexShrink: 0 }} />}
                      <span style={{ fontSize: 16, fontWeight: 800, color }}>{formaActiva}</span>
                    </div>
                    {formaActivaData && (
                      <>
                        <span style={{ fontSize: 11, color: alpha(color, 0.7), display: 'block', marginTop: 2 }}>
                          {formaActivaData.spren}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 4, lineHeight: 1.4 }}>
                          {formaActivaData.bonos}
                        </span>
                        {formaActivaData.esPoder && (
                          <span style={{ fontSize: 10, color: '#fb923c', display: 'block', marginTop: 5, fontStyle: 'italic' }}>
                            ⚠ Forma de poder — riesgo de influencia de Odium
                          </span>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: '6px 0 0', fontStyle: 'italic' }}>
                    Sin forma activa. Toca "Cambiar ▶" para seleccionar una.
                  </p>
                )}
              </div>

              {/* Árbol de talentos de cantor */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
                <div style={{ minWidth: 'max-content' }}>
                  {renderForest(buildCantorTNodes(), color)}
                </div>
              </div>
            </div>
          )
        })()}

      </div>{/* end tree content */}

      {/* ── Talent drawer ──────────────────────────────────────────────── */}
      {drawerNode && (
        <>
          <div onClick={() => setDrawerNode(null)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }} />
          <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71, background: 'var(--surface-1)', borderRadius: '20px 20px 0 0', border: '1px solid var(--border-bright)', borderBottom: 'none', maxHeight: '58vh', display: 'flex', flexDirection: 'column', paddingBottom: 'calc(20px + var(--sab, 0px))' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
            </div>
            <button onClick={() => setDrawerNode(null)} style={{ position: 'absolute', top: 10, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 6 }}>
              <X size={18} />
            </button>
            <div style={{ padding: '12px 20px 0', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* ── Modo picker de forma activa ──────────────────────────── */}
              {drawerNode.isFormaPicker ? (
                <>
                  <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Seleccionar forma activa</p>
                  <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0, lineHeight: 1.4 }}>
                    Solo puedes estar en una forma a la vez. El cambio ocurre durante una alta tormenta.
                  </p>
                  {drawerNode.cantorFormas?.map((forma) => {
                    const isActive = getFormaActiva(selectedTalentos) === forma.nombre
                    return (
                      <div key={forma.nombre} style={{ borderRadius: 10, border: isActive ? `1.5px solid ${alpha(drawerNode.color, 0.55)}` : '1px solid var(--border)', background: isActive ? alpha(drawerNode.color, 0.07) : 'var(--surface-2)', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            {forma.esPoder && <Zap size={11} style={{ color: '#fb923c' }} />}
                            <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? drawerNode.color : 'var(--text)' }}>{forma.nombre}</span>
                            {isActive && <span style={{ fontSize: 9, fontWeight: 800, color: drawerNode.color, letterSpacing: '0.08em' }}>✓ ACTIVA</span>}
                          </div>
                          {!isActive && (
                            <button
                              onClick={() => { talentosMutation.mutate(withFormaActiva(selectedTalentos, forma.nombre)); setDrawerNode(null) }}
                              style={{ fontSize: 11, fontWeight: 700, color: drawerNode.color, background: alpha(drawerNode.color, 0.1), border: `1px solid ${alpha(drawerNode.color, 0.3)}`, borderRadius: 20, padding: '3px 10px', cursor: 'pointer' }}
                            >
                              Activar
                            </button>
                          )}
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--text-subtle)', display: 'block' }}>{forma.spren}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 3, lineHeight: 1.35 }}>{forma.bonos}</span>
                        {forma.esPoder && <span style={{ fontSize: 10, color: '#fb923c', display: 'block', marginTop: 4, fontStyle: 'italic' }}>⚠ Vacíospren — influencia de Odium</span>}
                      </div>
                    )
                  })}
                </>
              ) : (
                /* ── Modo normal del drawer ────────────────────────────── */
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: drawerNode.state === 'selected' ? drawerNode.color : 'var(--text)' }}>
                      {drawerNode.name}
                    </span>
                    {drawerNode.activation && <TalentActivation type={drawerNode.activation} compact />}
                    {drawerNode.source && (
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 20, background: alpha(drawerNode.color, 0.12), border: `1px solid ${alpha(drawerNode.color, 0.3)}`, color: drawerNode.color }}>
                        {drawerNode.source.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {drawerNode.prereq && (
                    <div style={{ padding: '7px 10px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em' }}>PRERREQUISITO</span>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '3px 0 0', lineHeight: 1.4 }}>
                        {drawerNode.prereq}
                        {drawerNode.state === 'selected' && <span style={{ color: drawerNode.color, marginLeft: 4 }}>✓</span>}
                        {drawerNode.state === 'locked' && drawerNode.missing.length > 0 && (
                          <span style={{ color: '#f59e0b', display: 'block', marginTop: 3 }}>✗ Falta: {drawerNode.missing.join(', ')}</span>
                        )}
                      </p>
                    </div>
                  )}

                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-line' }}>
                    {drawerNode.description}
                  </p>

                  {/* Formas que desbloquea este talento de cantor */}
                  {drawerNode.cantorFormas && drawerNode.cantorFormas.length > 0 && (
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-subtle)', letterSpacing: '0.08em', margin: '4px 0 8px' }}>
                        FORMAS {drawerNode.state === 'selected' ? 'DESBLOQUEADAS' : 'QUE OBTENDRÁS'}
                      </p>
                      {drawerNode.cantorFormas.map((forma) => {
                        const isActive = getFormaActiva(selectedTalentos) === forma.nombre
                        return (
                          <div key={forma.nombre} style={{ borderRadius: 8, border: `1px solid ${isActive ? alpha(drawerNode.color, 0.45) : 'var(--border)'}`, background: isActive ? alpha(drawerNode.color, 0.07) : 'var(--surface-2)', padding: '8px 10px', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                {forma.esPoder && <Zap size={10} style={{ color: '#fb923c' }} />}
                                <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? drawerNode.color : 'var(--text)' }}>{forma.nombre}</span>
                                {isActive && <span style={{ fontSize: 9, fontWeight: 800, color: drawerNode.color }}>✓</span>}
                              </div>
                              {drawerNode.state === 'selected' && !isActive && (
                                <button
                                  onClick={() => { talentosMutation.mutate(withFormaActiva(selectedTalentos, forma.nombre)); setDrawerNode(null) }}
                                  style={{ fontSize: 10, fontWeight: 700, color: drawerNode.color, background: alpha(drawerNode.color, 0.1), border: `1px solid ${alpha(drawerNode.color, 0.3)}`, borderRadius: 20, padding: '2px 8px', cursor: 'pointer' }}
                                >
                                  Activar
                                </button>
                              )}
                            </div>
                            <span style={{ fontSize: 10, color: 'var(--text-subtle)', display: 'block', marginTop: 2 }}>{forma.spren}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 2, lineHeight: 1.3 }}>{forma.bonos}</span>
                            {forma.accionesEspeciales?.map((a) => (
                              <span key={a} style={{ fontSize: 10, color: '#fb923c', display: 'block', marginTop: 3 }}>{a}</span>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {!drawerNode.isAutoAdded && (
                    <div style={{ marginTop: 4, paddingBottom: 4 }}>
                      {drawerNode.state === 'selected' ? (() => {
                        const afterRemove = computeCascadeRemove(drawerNode.name)
                        const alsoRemoved = selectedTalentos
                          .filter((n) => !n.startsWith(FORMA_ACTIVA_PREFIX))
                          .filter((n) => n !== drawerNode.name && !afterRemove.includes(n))
                        return (
                          <>
                            {alsoRemoved.length > 0 && (
                              <div style={{ padding: '8px 10px', borderRadius: 8, marginBottom: 8, background: 'rgba(251,113,133,0.07)', border: '1px solid rgba(251,113,133,0.25)' }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: '#fb7185', margin: '0 0 4px', letterSpacing: '0.06em' }}>TAMBIÉN SE OLVIDARÁN</p>
                                {alsoRemoved.map((n) => <p key={n} style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0', lineHeight: 1.3 }}>· {n}</p>)}
                              </div>
                            )}
                            <button
                              onClick={() => { talentosMutation.mutate(afterRemove); setDrawerNode(null) }}
                              style={{ width: '100%', padding: '11px', borderRadius: 10, background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            >
                              <X size={14} />
                              {alsoRemoved.length > 0 ? `Olvidar ${1 + alsoRemoved.length} talentos` : 'Olvidar talento'}
                            </button>
                          </>
                        )
                      })() : drawerNode.state === 'available' ? (
                        <button
                          onClick={() => { talentosMutation.mutate([...selectedTalentos, drawerNode.name]); setDrawerNode(null) }}
                          style={{ width: '100%', padding: '11px', borderRadius: 10, background: alpha(drawerNode.color, 0.12), border: `1px solid ${alpha(drawerNode.color, 0.35)}`, color: drawerNode.color, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        >
                          <Plus size={14} /> Aprender talento
                        </button>
                      ) : (
                        <div style={{ width: '100%', padding: '11px', borderRadius: 10, textAlign: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-subtle)', fontSize: 13 }}>
                          🔒 Prerrequisitos no cumplidos
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
