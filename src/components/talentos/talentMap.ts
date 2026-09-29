/**
 * talentMap — pure model + fixed geometry for the talent map (no React, no DOM measuring).
 *
 * - buildPathModels(graph): one PathModel per path of the graph (heroic path, radiant order, singer),
 *   each with its key talent and its plates (specialty / spren bond / surge / singer grid) at the book's
 *   exact grid positions (data/talentGrids.ts).
 * - mapDims / laminaDims: the fixed geometry profiles (phone miniature, desktop, readable lámina).
 * - tracePlate(): edges drawn ONLY from real prerequisites (parentGroups of the engine), routed by
 *   fixed rules: straight, skip by the outer margin, lateral with arrow, diagonal through the gap
 *   between rows, long through the central channel. «o» groups meet in a join circle; «y» groups are
 *   separate lines. Parents outside the plate become text chips («también requiere: X»).
 */
import type { Gate, NodeEval, TalentGraph, TalentNode, TalentTree } from '../../lib/talentGraph'
import { TALENT_GRIDS } from '../../data/talentGrids'
import { TALENT_SUMMARIES } from '../../data/talentSummaries'
import { RADIANT_ORDERS } from '../../data/radiantOrders'

// ── Text helpers ─────────────────────────────────────────────────────────────

/** First sentence of a description (fallback when the book has no short summary). */
export function firstSentence(text: string): string {
  const m = text.match(/^[\s\S]*?[.!?](?=\s|$)/)
  return (m ? m[0] : text).trim()
}
/** Short book summary of a talent, else the first sentence of its description. */
export function summaryOf(node: Pick<TalentNode, 'name' | 'description'>): string {
  return TALENT_SUMMARIES[node.name] ?? firstSentence(node.description)
}
export const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

/** «Cazador · Arquero», «Corredores del Viento · Adhesión», «Cantor» */
export function sourceOf(node: TalentNode, graph: TalentGraph): string {
  const tree = graph.treeById.get(node.treeId)
  if (!tree) return node.section
  if (tree.kind === 'cantor') return node.isKey ? 'Cantor · ascendencia' : 'Cantor'
  if (node.isKey && tree.kind === 'heroico') return `${tree.pathName} · talento principal`
  if (node.isKey && tree.kind === 'radiante') return `${tree.pathName} · Primer Ideal`
  return `${tree.pathName} · ${tree.section}`
}

// ── Path models ──────────────────────────────────────────────────────────────

export type PlateKind = 'especialidad' | 'vinculo' | 'potencia' | 'cantor'
export interface PlateModel {
  tree: TalentTree
  kind: PlateKind
  cols: number
  rows: number
  /** nodeId → grid position (the path's key talent is never a cell) */
  pos: Map<string, { col: number; row: number }>
  /** cell node ids in book reading order (row by row, left to right) */
  order: string[]
  /** band label (specialty, «Vínculo», surge) */
  label: string
  /** full name for the lámina and the accessible names */
  fullLabel: string
}
export interface PathModel {
  /** 'heroico:<path>' | 'radiante:<order>' | 'cantor' */
  id: string
  kind: 'heroico' | 'radiante' | 'cantor'
  pathId: string
  title: string
  eyebrow: string
  color: string
  keyNode: TalentNode | null
  plates: PlateModel[]
  /** every node of the path, key included */
  nodeIds: string[]
  isStarting: boolean
  /** radiant order without talents (Forjadores de Vínculos) */
  noJugable: boolean
}

/** talentGrids.ts key of an engine tree */
export function gridKeyOf(tree: TalentTree): string {
  if (tree.kind === 'heroico') return `heroico:${tree.pathId}:${tree.section}`
  if (tree.kind === 'potencia') return `potencia:${tree.section}`
  if (tree.kind === 'radiante') return `radiante:${tree.pathId}`
  return 'cantor'
}

function plateOf(tree: TalentTree, graph: TalentGraph, kind: PlateKind, keyId: string | null, label: string, fullLabel: string): PlateModel {
  const ids = tree.nodeIds.filter((id) => id !== keyId)
  const grid = TALENT_GRIDS[gridKeyOf(tree)]
  const pos = new Map<string, { col: number; row: number }>()
  let cols = 2
  if (grid) {
    cols = grid.cols
    const used = new Set<string>()
    for (const id of ids) {
      const name = graph.byId.get(id)?.name
      const cell = grid.cells.find((c) => c.name === name && !used.has(`${c.col}:${c.row}`))
      if (cell) {
        used.add(`${cell.col}:${cell.row}`)
        pos.set(id, { col: cell.col, row: cell.row })
      }
    }
    // talents missing from the grid: next free slots, never invented positions over other cells
    let next = Math.max(-1, ...[...pos.values()].map((p) => p.row)) + 1
    for (const id of ids) if (!pos.has(id)) { pos.set(id, { col: 0, row: next }); next++ }
  } else {
    ids.forEach((id, i) => pos.set(id, { col: i % 2, row: Math.floor(i / 2) }))
  }
  // the key row (Primer Ideal / Cambiar de forma at row 0) lives above the plate, as in the book
  const minRow = Math.min(...[...pos.values()].map((p) => p.row))
  if (Number.isFinite(minRow) && minRow > 0) for (const p of pos.values()) p.row -= minRow
  const rows = pos.size ? Math.max(...[...pos.values()].map((p) => p.row)) + 1 : 0
  const order = [...ids].sort((a, b) => {
    const pa = pos.get(a)!, pb = pos.get(b)!
    return pa.row - pb.row || pa.col - pb.col
  })
  return { tree, kind, cols, rows, pos, order, label, fullLabel }
}

export function buildPathModels(graph: TalentGraph): PathModel[] {
  const out: PathModel[] = []
  for (const root of graph.trees.filter((t) => t.kind === 'heroico' && t.sectionId === 'principal')) {
    const key = root.keyNodeId ? graph.byId.get(root.keyNodeId) ?? null : null
    const plates = graph.trees
      .filter((t) => t.kind === 'heroico' && t.pathId === root.pathId && t.sectionId !== 'principal')
      .map((t) => plateOf(t, graph, 'especialidad', key?.id ?? null, t.section, t.section))
    out.push({
      id: root.id, kind: 'heroico', pathId: root.pathId, title: root.pathName, eyebrow: 'Camino heroico', color: root.color,
      keyNode: key, plates, nodeIds: [...(key ? [key.id] : []), ...plates.flatMap((p) => p.order)],
      isStarting: root.isStartingPath, noJugable: false,
    })
  }
  const bond = graph.trees.find((t) => t.kind === 'radiante')
  if (bond) {
    const order = RADIANT_ORDERS.find((o) => o.id === bond.pathId)
    const key = bond.keyNodeId ? graph.byId.get(bond.keyNodeId) ?? null : null
    const plates: PlateModel[] = []
    if (bond.status === 'ok') {
      plates.push(plateOf(bond, graph, 'vinculo', key?.id ?? null, 'Vínculo', bond.section))
      for (const t of graph.trees.filter((x) => x.kind === 'potencia' && x.pathId === bond.pathId))
        plates.push(plateOf(t, graph, 'potencia', key?.id ?? null, t.section, t.section))
    }
    out.push({
      id: bond.id, kind: 'radiante', pathId: bond.pathId, title: order?.name ?? bond.pathName, eyebrow: 'Camino radiante',
      color: bond.color, keyNode: key, plates, nodeIds: [...(key ? [key.id] : []), ...plates.flatMap((p) => p.order)],
      isStarting: true, noJugable: bond.status === 'noJugable',
    })
  }
  const cantor = graph.trees.find((t) => t.kind === 'cantor')
  if (cantor) {
    const key = cantor.keyNodeId ? graph.byId.get(cantor.keyNodeId) ?? null : null
    const plate = plateOf(cantor, graph, 'cantor', key?.id ?? null, 'Talentos de cantor', 'Talentos de cantor')
    out.push({
      id: cantor.id, kind: 'cantor', pathId: 'cantor', title: 'Cantor', eyebrow: 'Ascendencia cantora', color: cantor.color,
      keyNode: key, plates: [plate], nodeIds: [...(key ? [key.id] : []), ...plate.order], isStarting: true, noJugable: false,
    })
  }
  return out
}

// ── Cell marks (state vocabulary) ────────────────────────────────────────────

export type CellMark =
  | { kind: 'learned'; granted: boolean }
  | { kind: 'elsewhere' }
  | { kind: 'available'; dj: boolean }
  | { kind: 'locked'; distance: number | null; badge: 'nivel' | 'ideal' | 'dj' | null; minLevel: number }

const idealUnmet = (g: Gate) => g.kind === 'ideal' && g.status !== 'met'

/** One mark per cell: NV > Ideal > DJ (the cell shows only its own gates, like the book). */
export function cellMark(ev: NodeEval | undefined, level: number, granted = false): CellMark {
  if (!ev) return { kind: 'locked', distance: null, badge: null, minLevel: level }
  if (ev.state === 'learned') return { kind: 'learned', granted }
  if (ev.state === 'learnedElsewhere') return { kind: 'elsewhere' }
  if (ev.state === 'available') return { kind: 'available', dj: ev.needsConfirmation }
  const badge = ev.minLevel > level ? 'nivel' : ev.gates.some(idealUnmet) ? 'ideal' : ev.gates.some((g) => g.status === 'confirm') ? 'dj' : null
  return { kind: 'locked', distance: ev.distance, badge, minLevel: ev.minLevel }
}

/** State in plain words: «Aprendido», «Disponible ahora», «A 4 talentos · lo antes posible en Nv 6». */
export function stateWords(mark: CellMark, level: number): string {
  switch (mark.kind) {
    case 'learned': return mark.granted ? 'Concedido' : 'Aprendido'
    case 'elsewhere': return 'Aprendido en otra rama'
    case 'available': return mark.dj ? 'Disponible · lo confirma la DJ' : 'Disponible ahora'
    default: {
      if (mark.distance === null) return 'Fuera de tus caminos'
      const lv = mark.minLevel > level ? ` · lo antes posible en Nv ${mark.minLevel}` : ''
      return `A ${mark.distance} ${plural(mark.distance, 'talento', 'talentos')}${lv}`
    }
  }
}

// ── Geometry profiles ────────────────────────────────────────────────────────

export interface Dims {
  margin: number
  channel: number
  cellW: number
  cellH: number
  rowGap: number
  bandH: number
  /** band bottom → first row */
  topGap: number
  bottomPad: number
  plateGap: number
  plateW: number
  joinR: number
  arrow: number
  stroke: number
  strokeMet: number
  strokeRoute: number
}

/**
 * Content width of the page column for a viewport width (mobile gutter 16, tablet rail 80, desktop sidebar 248).
 * Floored well below any real device width: a transient 0/near-0 `vw` (first paint, WebView resize, orientation
 * change) must never cascade into a negative cellW/plateW and an invalid SVG width/viewBox.
 */
export function contentWidthFor(vw: number): number {
  if (vw < 640) return Math.max(240, vw - 32)
  const col = Math.min(680, vw - (vw < 1024 ? 80 : 248) - 12)
  return Math.max(240, col - 32)
}
export const WIDE_MIN = 600

/** Map profile: phone miniature (44×26 cells at 390 px) or desktop (readable cells, 680 px column). */
export function mapDims(contentW: number): Dims {
  if (contentW >= WIDE_MIN) {
    const plateGap = 9
    const plateW = Math.floor((Math.min(contentW, 648) - 2 * plateGap) / 3)
    const margin = 6, channel = 11
    const cellW = Math.floor((plateW - 2 * margin - channel) / 2)
    return {
      margin, channel, cellW, cellH: 60, rowGap: 16, bandH: 28, topGap: 12, bottomPad: 6, plateGap,
      plateW: 2 * margin + 2 * cellW + channel, joinR: 8, arrow: 5, stroke: 1.3, strokeMet: 1.7, strokeRoute: 2.6,
    }
  }
  const plateGap = 8
  const plateW = Math.min(114, Math.floor((contentW - 2 * plateGap) / 3))
  const tight = plateW < 104
  const margin = tight ? 5 : 7, channel = tight ? 8 : 12
  const cellW = Math.floor((plateW - 2 * margin - channel) / 2)
  return {
    margin, channel, cellW, cellH: 26, rowGap: 15, bandH: 24, topGap: 9, bottomPad: 4, plateGap,
    plateW: 2 * margin + 2 * cellW + channel, joinR: 7, arrow: 4, stroke: 1.25, strokeMet: 1.6, strokeRoute: 2.4,
  }
}

/**
 * Readable lámina: 2 lanes of cards with the full name (summary added on desktop).
 * `cellH` is sized for the worst-case card, not the average one: a 2-line clamped name, a compacted
 * requirement line per gate (up to ~4 stacked clauses — a talent + skill + level + DJ condition can all
 * land on one node, e.g. the radiant Ideal cards, which is the tallest real case in the book's trees —
 * «tienes N» lives in the brief/ficha, not here) and the one-line state, so it fits at every phone width
 * (320–440px) without clipping. Keep in sync with the bits block's own `maxHeight` in TalentLamina.tsx.
 */
export function laminaDims(contentW: number): Dims {
  const wide = contentW >= WIDE_MIN
  const W = Math.min(contentW, wide ? 648 : 420)
  const margin = wide ? 14 : 10, channel = wide ? 28 : 22
  const cellW = Math.floor((W - 2 * margin - channel) / 2)
  return {
    margin, channel, cellW, cellH: wide ? 190 : 150, rowGap: 24, bandH: 0, topGap: 14, bottomPad: 8, plateGap: 0,
    plateW: 2 * margin + 2 * cellW + channel, joinR: 9, arrow: 6, stroke: 1.4, strokeMet: 1.8, strokeRoute: 2.75,
  }
}

export interface PlateBox {
  width: number
  height: number
  /** lanes: x of each lane's left edge */
  laneX: number[]
  cellW: number
  cellH: number
}

/** Size and lanes of a plate. `width` widens it (the 3-lane singer plate spans two plates). */
export function plateBox(d: Dims, cols: number, rows: number, width?: number): PlateBox {
  const natural = 2 * d.margin + cols * d.cellW + (cols - 1) * d.channel
  const W = Math.max(natural, width ?? natural)
  const channel = cols > 1 ? (W - 2 * d.margin - cols * d.cellW) / (cols - 1) : 0
  const laneX = Array.from({ length: cols }, (_, i) => d.margin + i * (d.cellW + channel))
  const height = d.bandH + d.topGap + Math.max(1, rows) * d.cellH + Math.max(0, rows - 1) * d.rowGap + d.bottomPad
  return { width: W, height, laneX, cellW: d.cellW, cellH: d.cellH }
}

export interface Rect { x: number; y: number; w: number; h: number }
export function cellRect(d: Dims, box: PlateBox, col: number, row: number): Rect {
  return { x: box.laneX[col] ?? d.margin, y: d.bandH + d.topGap + row * (d.cellH + d.rowGap), w: d.cellW, h: d.cellH }
}

// ── Edge tracer ──────────────────────────────────────────────────────────────

export type EdgeStatus = 'pending' | 'met' | 'route' | 'hl'
export interface EdgeDraw {
  key: string
  d: string
  /** arrowhead polygon (side entries: skip, lateral, long) */
  arrow?: string
  status: EdgeStatus
  /** null = from the band (the path's key talent) */
  parentId: string | null
  childId: string
}
export interface JoinDraw { key: string; x: number; y: number; r: number; status: EdgeStatus; childId: string; parentIds: string[] }
export interface ChipNote { childId: string; text: string }
export interface PlateTrace {
  box: PlateBox
  rects: Map<string, Rect>
  edges: EdgeDraw[]
  joins: JoinDraw[]
  chips: ChipNote[]
}

/** Status of one requirement line: owned parent = met; on the goal route = route. */
export type EdgeStatusFn = (parentName: string, parentId: string | null, childId: string, clauseIndex: number) => EdgeStatus

const arrowHead = (x: number, y: number, dir: 'left' | 'right' | 'up' | 'down', a: number): string => {
  const w = a * 0.7
  switch (dir) {
    case 'right': return `M${x} ${y}L${x - a} ${y - w}L${x - a} ${y + w}Z`
    case 'left': return `M${x} ${y}L${x + a} ${y - w}L${x + a} ${y + w}Z`
    case 'down': return `M${x} ${y}L${x - w} ${y - a}L${x + w} ${y - a}Z`
    default: return `M${x} ${y}L${x - w} ${y + a}L${x + w} ${y + a}Z`
  }
}
const r1 = (n: number) => Math.round(n * 10) / 10

type Pt = [number, number]
interface Route { pts: Pt[]; arrow?: { x: number; y: number; dir: 'left' | 'right' | 'up' | 'down' } }
interface Seg { x1: number; y1: number; x2: number; y2: number; parent: string; child: string }

/** Two segments of different edges (no shared parent or child) running over each other. */
function clash(a: Seg, b: Seg): boolean {
  if (a.parent === b.parent || a.child === b.child) return false
  const av = a.x1 === a.x2, bv = b.x1 === b.x2
  if (av && bv) return Math.abs(a.x1 - b.x1) < 1.5 && Math.min(Math.max(a.y1, a.y2), Math.max(b.y1, b.y2)) - Math.max(Math.min(a.y1, a.y2), Math.min(b.y1, b.y2)) > 0.5
  const ah = a.y1 === a.y2, bh = b.y1 === b.y2
  if (ah && bh) return Math.abs(a.y1 - b.y1) < 1.5 && Math.min(Math.max(a.x1, a.x2), Math.max(b.x1, b.x2)) - Math.max(Math.min(a.x1, a.x2), Math.min(b.x1, b.x2)) > 0.5
  return false
}

/**
 * Edges of one plate. Each requirement tries its fixed route first and, when it would run over another
 * edge, a lane shifted by a few px; if no clean route exists it becomes a chip («también requiere: X»).
 */
export function tracePlate(plate: PlateModel, graph: TalentGraph, d: Dims, statusOf: EdgeStatusFn, width?: number): PlateTrace {
  const box = plateBox(d, plate.cols, plate.rows, width)
  const rects = new Map<string, Rect>()
  for (const [id, p] of plate.pos) rects.set(id, cellRect(d, box, p.col, p.row))
  const edges: EdgeDraw[] = []
  const joins: JoinDraw[] = []
  const chips: ChipNote[] = []
  const segs: Seg[] = []
  const last = plate.cols - 1
  const bandBottom = d.bandH
  const cx = (r: Rect) => r1(r.x + r.w / 2)
  const midY = (r: Rect) => r1(r.y + r.h / 2)
  const gapBelow = (r: Rect) => r1(r.y + r.h + d.rowGap / 2)
  const gapAbove = (r: Rect) => r1(r.y - (r.y - bandBottom <= d.topGap + 0.5 ? d.topGap : d.rowGap) / 2)
  /** centre of the channel right of lane k, and its free half-width */
  const channelX = (k: number) => r1(box.laneX[k] + d.cellW + (box.laneX[k + 1] - box.laneX[k] - d.cellW) / 2)
  const channelHalf = last > 0 ? (box.laneX[1] - box.laneX[0] - d.cellW) / 2 : 0
  const outerX = (col: number): number | null => (col === 0 ? r1(d.margin / 2) : col === last ? r1(box.width - d.margin / 2) : null)
  /** lane candidates: centre, then shifted inside the free space */
  const laneXs = (x: number, half: number): number[] => {
    const out = [x]
    const step = Math.min(3, Math.max(0, half - 1.5))
    if (step >= 2) out.push(r1(x - step), r1(x + step))
    return out
  }
  const toSegs = (r: Route, parent: string, child: string): Seg[] => {
    const out: Seg[] = []
    for (let i = 1; i < r.pts.length; i++) out.push({ x1: r.pts[i - 1][0], y1: r.pts[i - 1][1], x2: r.pts[i][0], y2: r.pts[i][1], parent, child })
    return out
  }
  const toD = (r: Route) => r.pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('')
  /** the first clean candidate is committed; null = no clean route */
  const commit = (cands: Route[], parent: string, child: string): Route | null => {
    for (const r of cands) {
      const mine = toSegs(r, parent, child)
      if (mine.some((m) => segs.some((o) => clash(m, o)))) continue
      segs.push(...mine)
      return r
    }
    return null
  }

  for (const childId of plate.order) {
    const child = graph.byId.get(childId)
    const C = rects.get(childId)
    const cpos = plate.pos.get(childId)
    if (!child || !C || !cpos) continue
    const outside: string[] = []
    for (const group of child.parentGroups) {
      const inPlate = group.options.filter((o) => o.nodeId && (rects.has(o.nodeId) || o.nodeId === plate.tree.keyNodeId))
      const rest = group.options.filter((o) => !inPlate.includes(o))
      if (!inPlate.length) {
        outside.push(group.options.map((o) => o.name).join(' o '))
        continue
      }
      const cellOpts = inPlate.filter((o) => o.nodeId && rects.has(o.nodeId))
      const J = cellOpts.length >= 2 && cpos.row > 0 ? { x: cx(C), y: gapAbove(C) } : null
      const statuses: EdgeStatus[] = []
      const failed: string[] = rest.map((o) => o.name)
      let drawnInJoin = 0
      for (const o of inPlate) {
        const st = statusOf(o.name, o.nodeId, childId, group.clauseIndex)
        const key = `${o.nodeId}>${childId}#${group.clauseIndex}`
        const P = o.nodeId ? rects.get(o.nodeId) : undefined
        const ppos = o.nodeId ? plate.pos.get(o.nodeId) : undefined
        const parentKey = o.nodeId ?? 'band'
        const cands: Route[] = []
        const joinable = !!J && !!P && cellOpts.includes(o)
        if (!P || !ppos) {
          // from the band: the path's key talent
          if (cpos.row === 0) cands.push({ pts: [[cx(C), bandBottom], [cx(C), C.y]] })
          else {
            const ox = outerX(cpos.col)
            const side = cpos.col === 0 ? C.x : C.x + C.w
            if (ox !== null) for (const x of laneXs(ox, d.margin / 2)) cands.push({ pts: [[x, bandBottom], [x, midY(C)], [side, midY(C)]], arrow: { x: side, y: midY(C), dir: cpos.col === 0 ? 'right' : 'left' } })
            if (last > 0) {
              const k = cpos.col > 0 ? cpos.col - 1 : 0
              const inner = cpos.col > 0 ? C.x : C.x + C.w
              for (const x of laneXs(channelX(k), channelHalf)) cands.push({ pts: [[x, bandBottom], [x, midY(C)], [inner, midY(C)]], arrow: { x: inner, y: midY(C), dir: cpos.col > 0 ? 'right' : 'left' } })
            }
          }
        } else {
          const dc = cpos.col - ppos.col
          const dr = cpos.row - ppos.row
          const endJ = (fromX: number): Pt => [r1(J!.x + (fromX < J!.x ? -d.joinR : d.joinR)), J!.y]
          if (dc === 0 && dr === 1) {
            cands.push({ pts: [[cx(P), P.y + P.h], [cx(P), joinable ? r1(J!.y - d.joinR) : C.y]] })
          } else if (dc === 0) {
            // skip by the outer margin (also upwards); the middle lane of the singer plate uses its left channel
            const ox = outerX(cpos.col)
            const leftSide = cpos.col === 0 || ox === null
            const sideP = leftSide ? P.x : P.x + P.w
            const sideC = leftSide ? C.x : C.x + C.w
            const xs = ox !== null ? laneXs(ox, d.margin / 2) : laneXs(channelX(cpos.col - 1), channelHalf)
            for (const x of xs) {
              if (joinable && dr > 0) cands.push({ pts: [[sideP, midY(P)], [x, midY(P)], [x, J!.y], endJ(x)] })
              else cands.push({ pts: [[sideP, midY(P)], [x, midY(P)], [x, midY(C)], [sideC, midY(C)]], arrow: { x: sideC, y: midY(C), dir: leftSide ? 'right' : 'left' } })
            }
          } else if (dr === 0) {
            const toRight = dc > 0
            if (Math.abs(dc) === 1) {
              const x1 = toRight ? P.x + P.w : P.x
              const x2 = toRight ? C.x : C.x + C.w
              cands.push({ pts: [[x1, midY(C)], [x2, midY(C)]], arrow: { x: x2, y: midY(C), dir: toRight ? 'right' : 'left' } })
            } else {
              for (const dy of [0, 3, -3]) {
                const y = r1(gapBelow(P) + dy)
                cands.push({ pts: [[cx(P), P.y + P.h], [cx(P), y], [cx(C), y], [cx(C), C.y + C.h]], arrow: { x: cx(C), y: C.y + C.h, dir: 'up' } })
              }
            }
          } else if (dr === 1) {
            // diagonal through the gap between the two rows
            if (joinable) cands.push({ pts: [[cx(P), P.y + P.h], [cx(P), J!.y], endJ(cx(P))] })
            else for (const dy of dc > 0 ? [-2, 2, 0] : [2, -2, 0]) {
              const y = r1(gapBelow(P) + dy)
              cands.push({ pts: [[cx(P), P.y + P.h], [cx(P), y], [cx(C), y], [cx(C), C.y]] })
            }
          } else if (dr > 1) {
            // long: into the channel between both lanes, down, then into the child's inner side
            const k = Math.min(Math.max(0, dc > 0 ? cpos.col - 1 : cpos.col), last - 1)
            for (const x of laneXs(channelX(k), channelHalf)) {
              const y0 = r1(gapBelow(P) + 2)
              if (joinable) cands.push({ pts: [[cx(P), P.y + P.h], [cx(P), y0], [x, y0], [x, J!.y], endJ(x)] })
              else {
                const side = x < C.x ? C.x : C.x + C.w
                cands.push({ pts: [[cx(P), P.y + P.h], [cx(P), y0], [x, y0], [x, midY(C)], [side, midY(C)]], arrow: { x: side, y: midY(C), dir: side === C.x ? 'right' : 'left' } })
              }
            }
          } else {
            // upwards to another lane: out of the parent's inner side, up the channel, into the child's inner side
            const toRight = dc > 0
            const k = Math.min(ppos.col, cpos.col)
            const sideP = toRight ? P.x + P.w : P.x
            const sideC = toRight ? C.x : C.x + C.w
            for (const x of laneXs(channelX(k), channelHalf)) {
              const y1 = r1(midY(P) + 4), y2 = r1(midY(C) + 4)
              cands.push({ pts: [[sideP, y1], [x, y1], [x, y2], [sideC, y2]], arrow: { x: sideC, y: y2, dir: toRight ? 'right' : 'left' } })
            }
          }
        }
        const r = commit(cands, parentKey, childId)
        if (!r) { failed.push(o.name); continue }
        statuses.push(st)
        if (joinable) drawnInJoin++
        edges.push({ key, d: toD(r), arrow: r.arrow ? arrowHead(r.arrow.x, r.arrow.y, r.arrow.dir, d.arrow) : undefined, status: st, parentId: o.nodeId, childId })
      }
      if (failed.length) outside.push(`${failed.length < group.options.length ? 'o ' : ''}${failed.join(' o ')}`)
      if (J && drawnInJoin > 0) {
        const status: EdgeStatus = statuses.includes('route') ? 'route' : statuses.includes('met') ? 'met' : 'pending'
        joins.push({ key: `${childId}#${group.clauseIndex}`, x: J.x, y: J.y, r: d.joinR, status, childId, parentIds: cellOpts.map((o) => o.nodeId!) })
        edges.push({ key: `${childId}#${group.clauseIndex}>`, d: `M${J.x} ${r1(J.y + d.joinR)}V${C.y}`, status, parentId: null, childId })
        segs.push({ x1: J.x, y1: J.y, x2: J.x, y2: C.y, parent: `join:${childId}`, child: childId })
      }
    }
    if (outside.length) chips.push({ childId, text: outside.join(' · ') })
  }
  return { box, rects, edges, joins, chips }
}

/** Real parents and children of a node (for hover/focus highlight and text relations). */
export function relationsOf(graph: TalentGraph, nodeId: string): { parents: Set<string>; children: Set<string> } {
  const node = graph.byId.get(nodeId)
  const parents = new Set<string>()
  for (const g of node?.parentGroups ?? []) for (const o of g.options) if (o.nodeId) parents.add(o.nodeId)
  return { parents, children: new Set(node?.childIds ?? []) }
}

/** «Robusto o Poderoso y Primer Ideal» — the talent part of the requirements, in words. */
export function requiresText(node: TalentNode): string {
  return node.parentGroups.map((g) => g.options.map((o) => o.name).join(' o ')).join(' y ')
}

/** DOM id of a map cell / key box */
export const cellDomId = (nodeId: string) => `tcell-${nodeId.replace(/[^\p{L}\p{N}_-]+/gu, '_')}`
