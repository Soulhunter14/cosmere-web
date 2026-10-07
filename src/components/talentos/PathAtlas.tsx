/**
 * PathAtlas — one path (heroic path, radiant order, singer, Investida path with its powers, ancestry) as a miniature of the book's
 * double page: key-talent box with a double gold frame, bus, plates with a filled gold band and the 2×4 cells at the book's grid
 * positions, requirement lines from real prerequisites only. A tap on a cell opens an inline brief card under the map; a tap on a band
 * opens the readable lámina. Fixed geometry (talentMap.ts). The plates go in rows of at most 3 slots, each row with its own bus; the
 * atlas of an Investida path also offers «Otros poderes»: the plates of the powers the path unlocks that the character lacks, read only.
 */
import { Fragment, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { Check, ChevronDown, Hourglass, Music, Plus, Target, X } from 'lucide-react'
import { Button, Disclosure, IconButton } from '../ui'
import { HeroicPathIcon } from '../GameIcons'
import { RadiantOrderIcon } from '../RadiantOrderIcon'
import { c, eyebrow, font, fs, radius, shadow, titleText, tone } from '../../theme'
import { buildTalentGraph, evaluate, type TalentEvaluation, type TalentGraph, type TalentNode, type TalentState } from '../../lib/talentGraph'
import { useEra, useWorldConfig } from '../../store/campaignStore'
import { isAvailable } from '../../worlds'
import type { PoderDef, WorldConfig } from '../../worlds/types'
import {
  WIDE_MIN, buildOtherPowersModel, cellDomId, cellMark, mapDims, otherPowerDefs, packRows, plateSlots, plural, relationsOf, requiresText,
  sourceOf, stateWords, summaryOf, tracePlate,
  type CellMark, type Dims, type EdgeStatusFn, type PathModel, type PlateModel, type PlateTrace,
} from './talentMap'
import { ACTIVATION, BAND_BG, BAND_FG, META_LOCKED, accentOf, type Accent } from './talentStyle'
import { ActIcon, CellMarkView, EdgeLayer, MetalMark, StepBadge } from './MapPieces'
import { TalentLamina } from './TalentLamina'

export interface AtlasProps {
  model: PathModel
  graph: TalentGraph
  evaluation: TalentEvaluation
  level: number
  contentW: number
  edgeStatus: EdgeStatusFn
  stepOf: ReadonlyMap<string, number>
  targetId: string | null
  selectedId: string | null
  onSelect: (id: string | null) => void
  openLaminas: ReadonlySet<string>
  onToggleLamina: (treeId: string) => void
  onCloseLaminas: (treeIds: string[]) => void
  onOpenSheet: (id: string) => void
  onLearn: (id: string) => void
  onSetGoal: (id: string) => void
  onRemoveGoal: () => void
  busy: boolean
  /** a path the character has not entered yet (its key talent costs 1 talent) */
  explore?: boolean
  surgeRank?: (surge: string) => number
  /**
   * The talent state of the character. With it, the atlas of an Investida path offers «Otros poderes»: the powers the path unlocks that the
   * character lacks, built into a second graph and evaluated against this same state (read only, nothing in them can be learned)
   */
  state?: TalentState
  /** `'otros'`: the plates of «Otros poderes» inside their Disclosure: no heading, no key box, no bus, a read-only brief card (internal) */
  variant?: 'otros'
  /** right side of the key box status row (singer: active form + Cambiar) */
  keyExtra?: ReactNode
  /** under the header (radiant: Ideales jurados; notes) */
  intro?: ReactNode
  /** just above the plates (singer: «Elige 1 (obligatorio)») */
  plateNote?: ReactNode
  /** end of the section (radiant: Ideales jurados) */
  outro?: ReactNode
  /** why the key talent is owned (radiant: «Ideal jurado» / «cuenta como jurado») */
  keyOwnedNote?: string
  headingLevel?: 2 | 3
}

function cellLabel(node: TalentNode, mark: CellMark, missing: string[], level: number, graph: TalentGraph, step?: number, target?: boolean): string {
  const parts = [`${node.name}, ${ACTIVATION[node.activation].label}.`, `${stateWords(mark, level)}.`]
  if (missing.length && mark.kind === 'locked') parts.push(`Falta: ${missing.join('; ')}.`)
  const req = requiresText(node)
  if (req) parts.push(`Requiere: ${req}.`)
  const kids = [...new Set(node.childIds.map((id) => graph.byId.get(id)?.name).filter(Boolean))]
  if (kids.length) parts.push(`Desbloquea: ${kids.join(', ')}.`)
  if (target) parts.push('Tu objetivo.')
  else if (step) parts.push(`Paso ${step} de la ruta.`)
  return parts.join(' ')
}

/** The icon of each world (§7.1): the Investida path and the ancestries are told by the config of the world, never by an id of a world */
const pathIcon = (model: PathModel, accent: Accent, size: number, cfg: WorldConfig) =>
  model.kind === 'heroico' ? <HeroicPathIcon id={model.pathId} size={size} style={{ color: accent.fg }} />
  : model.kind === 'radiante' ? <RadiantOrderIcon orderId={model.pathId} size={size + 4} decorative />
  : model.kind === 'caminoInvestido' ? <span aria-hidden style={{ display: 'inline-flex', color: accent.fg }}>{cfg.iconos.caminoInvestido(model.pathId, size)}</span>
  : model.kind === 'ascendencia' ? <span aria-hidden style={{ display: 'inline-flex', color: accent.fg }}>{cfg.ascendencias.find((a) => a.id === model.title)?.icono(size)}</span>
  : model.kind === 'poder' ? <MetalMark poderId={model.plates[0]?.poderId} size={size} style={{ color: accent.fg }} />
  : <Music size={size - 2} aria-hidden style={{ color: accent.fg }} />

/** The root of an atlas: a section named by its heading, or (the plates of «Otros poderes») a plain group inside the Disclosure */
function AtlasRoot({ bare, titleId, label, children }: { bare: boolean; titleId: string; label: string; children: ReactNode }) {
  if (bare) return <div role="group" aria-label={label}>{children}</div>
  return <section aria-labelledby={titleId} id={`${titleId}-section`} style={{ marginTop: 28, scrollMarginTop: 150 }}>{children}</section>
}

export function PathAtlas(props: AtlasProps) {
  const { model, graph, evaluation, level, contentW, edgeStatus, stepOf, targetId, selectedId, onSelect } = props
  const cfg = useWorldConfig()
  const era = useEra()
  const bare = props.variant === 'otros'
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [availOpen, setAvailOpen] = useState(false)
  const wide = contentW >= WIDE_MIN
  const d = useMemo(() => mapDims(contentW), [contentW])
  const accent = useMemo(() => accentOf(model.color), [model.color])
  // a plate of 3 or 4 lanes spans two plates (the singer, the nacidoble path)
  const traces = useMemo(
    () => model.plates.map((pl) => {
      const slots = plateSlots(pl)
      return tracePlate(pl, graph, d, edgeStatus, slots > 1 ? slots * d.plateW + (slots - 1) * d.plateGap : undefined)
    }),
    [model, graph, d, edgeStatus],
  )
  // rows of at most 3 slots, each centred, with its own bus and its own width (a single row for every Stormlight path)
  const rows = useMemo(() => packRows(model.plates), [model.plates])
  const rowLayout = rows.map((idx) => {
    let off = 0
    const centers: number[] = []
    for (const i of idx) { centers.push(off + traces[i].box.width / 2); off += traces[i].box.width + d.plateGap }
    return { idx, centers, w: Math.max(0, off - d.plateGap) }
  })
  const rowW = Math.max(0, ...rowLayout.map((r) => r.w))
  const related = useMemo(() => (hoverId ? relationsOf(graph, hoverId) : null), [graph, hoverId])

  const stateOf = (id: string) => evaluation.nodes.get(id)?.state
  const owned = model.nodeIds.filter((id) => stateOf(id) === 'learned' || stateOf(id) === 'learnedElsewhere').length
  const available = model.nodeIds.filter((id) => stateOf(id) === 'available')
  const H = `h${props.headingLevel ?? 2}` as 'h2' | 'h3'
  const subLevel = ((props.headingLevel ?? 2) + 1) as 3 | 4
  const titleId = `atlas-${model.id.replace(/[^a-z0-9]+/gi, '-')}`
  const briefId = `${titleId}-brief`
  const key = model.keyNode
  const selectedHere = selectedId && model.nodeIds.includes(selectedId) ? selectedId : null
  // the Investida path says what it is in the words of its world («Camino de nacido del metal»); the other models carry their own
  const eyebrowText = model.kind === 'caminoInvestido' && cfg.caminoInvestido ? cfg.caminoInvestido.label : model.eyebrow

  // caret of the brief card: centre of the selected cell, relative to the centred row of plates that holds it
  let caretX = rowW / 2
  let caretRow = 0
  if (selectedHere && selectedHere !== key?.id) {
    for (let ri = 0; ri < rowLayout.length; ri++) {
      let off = 0
      for (const i of rowLayout[ri].idx) {
        const r = traces[i].rects.get(selectedHere)
        if (r) { caretX = off + r.x + r.w / 2; caretRow = ri }
        off += traces[i].box.width + d.plateGap
      }
    }
  }
  const closeBrief = () => {
    const id = selectedHere
    onSelect(null)
    if (id) document.getElementById(cellDomId(id))?.focus()
  }
  const focusCell = (id: string) => {
    onSelect(id)
    const el = document.getElementById(cellDomId(id))
    el?.focus()
    el?.scrollIntoView({ block: 'center', behavior: 'auto' })
  }

  const openPlates = model.plates.filter((pl) => props.openLaminas.has(pl.tree.id))
  const busH = wide ? 20 : 16
  const keyOwned = key ? evaluation.learned.has(key.name) : true
  const busColour = keyOwned ? accent.ink : c.subtle
  // a bus joins the plates to the key box; without one (the plates of «Otros poderes», powers outside a path) the rows keep a gap of their own
  const busDrawn = !bare && !!key
  const allChips = traces.flatMap((t) => t.chips)

  // The brief card goes under the row that holds its cell when more rows follow it, so that its caret never points at another row
  const briefNode = selectedHere ? graph.byId.get(selectedHere) : undefined
  const briefAfterRow = selectedHere && selectedHere !== key?.id && rowLayout.length > 1 && caretRow < rowLayout.length - 1 ? caretRow : -1
  const brief = selectedHere && briefNode ? (
    <BriefCard
      id={briefId}
      node={briefNode}
      graph={graph}
      evaluation={evaluation}
      level={level}
      accent={accent}
      caretLeft={`calc(50% - ${(rowLayout[caretRow]?.w ?? rowW) / 2}px + ${caretX}px)`}
      isGoal={targetId === selectedHere}
      explore={!!props.explore}
      readOnly={bare}
      busy={props.busy}
      onClose={closeBrief}
      onOpenSheet={() => props.onOpenSheet(selectedHere)}
      onLearn={() => props.onLearn(selectedHere)}
      onSetGoal={() => props.onSetGoal(selectedHere)}
      onRemoveGoal={props.onRemoveGoal}
      headingLevel={subLevel}
    />
  ) : null

  // «Otros poderes»: the powers the Investida path unlocks that the character lacks and the era has (nothing without the talent state)
  const otherDefs = useMemo(
    () => (!bare && props.state && model.kind === 'caminoInvestido' ? otherPowerDefs(graph, model.pathId, era).filter((p) => isAvailable(p, era)) : []),
    [bare, props.state, model.kind, model.pathId, graph, era],
  )

  return (
    <AtlasRoot bare={bare} titleId={titleId} label={model.title}>
      {!bare && (
        <header style={{ marginBottom: 10 }}>
          <p style={{ ...eyebrow, color: c.gold }}>{eyebrowText}{props.explore ? ' · por explorar' : ''}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
            <H id={titleId} style={{ ...titleText, fontSize: wide ? fs.xl : 20, color: c.text, display: 'inline-flex', alignItems: 'center', gap: 8, margin: 0 }}>
              {pathIcon(model, accent, wide ? 22 : 20, cfg)}
              {model.title}
            </H>
            <span
              aria-label={`${owned} de ${model.nodeIds.length} talentos tuyos`}
              style={{ fontSize: fs.xs, fontWeight: 700, color: c.muted, background: c.s2, border: `1px solid ${c.border}`, borderRadius: radius.full, padding: '1px 8px', fontVariantNumeric: 'tabular-nums' }}
            >
              {owned}/{model.nodeIds.length}
            </span>
            {available.length > 0 && (
              <button
                type="button"
                className="ui-link"
                aria-expanded={availOpen}
                aria-controls={`${titleId}-avail`}
                onClick={() => setAvailOpen((v) => !v)}
                style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, minHeight: 36, padding: '0 2px', background: 'none', border: 'none', cursor: 'pointer', color: c.brand, fontSize: fs.sm, fontWeight: 650, textDecoration: 'none' }}
              >
                {available.length} {plural(available.length, 'disponible', 'disponibles')}
                <ChevronDown size={15} aria-hidden style={{ transform: availOpen ? 'rotate(180deg)' : undefined, transition: 'transform var(--dur-2)' }} />
              </button>
            )}
          </div>
          {availOpen && available.length > 0 && (
            <ul id={`${titleId}-avail`} aria-label="Se pueden aprender ahora" style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {available.map((id) => {
                const n = graph.byId.get(id)
                if (!n) return null
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => focusCell(id)}
                      className="ui-btn ui-btn--secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 36, padding: '0 12px', borderRadius: radius.full, border: `1.5px dashed ${accent.border}`, background: c.s1, color: c.text, fontSize: fs.sm, fontWeight: 600, cursor: 'pointer' }}
                    >
                      <Plus size={14} strokeWidth={3} aria-hidden style={{ color: accent.fg }} />
                      {n.name}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </header>
      )}

      {!bare && props.intro}

      {!bare && model.noJugable && (
        <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5, padding: '12px 14px', borderRadius: radius.md, border: `1px dashed ${c.borderBright}`, background: c.s2 }}>
          No jugable: los talentos de esta orden están reservados a la DJ. Elige otra orden en la ficha para planificar un camino radiante.
        </p>
      )}

      {!bare && key && (
        <KeyBox
          node={key}
          model={model}
          evaluation={evaluation}
          level={level}
          accent={accent}
          wide={wide}
          explore={!!props.explore}
          selected={selectedHere === key.id}
          briefId={briefId}
          onSelect={() => onSelect(selectedHere === key.id ? null : key.id)}
          onLearn={() => props.onLearn(key.id)}
          busy={props.busy}
          extra={props.keyExtra}
          ownedNote={props.keyOwnedNote}
          step={stepOf.get(key.id)}
          target={targetId === key.id}
          onHover={setHoverId}
        />
      )}

      {model.plates.length > 0 && (
        <>
          {rowLayout.map((row, ri) => (
            <Fragment key={ri}>
              {busDrawn && (
                <svg aria-hidden focusable="false" width={row.w} height={busH} style={{ display: 'block', margin: ri === 0 ? '0 auto' : '6px auto 0', overflow: 'visible' }}>
                  <path
                    d={`${ri === 0 ? `M${row.w / 2} 0V${busH / 2}` : ''}${row.centers.length > 1 ? `M${row.centers[0]} ${busH / 2}H${row.centers[row.centers.length - 1]}` : ''}${row.centers.map((x) => `M${x} ${busH / 2}V${busH}`).join('')}`}
                    stroke={hoverId && hoverId === key?.id ? c.text : busColour}
                    strokeWidth={keyOwned ? d.strokeMet : d.stroke}
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              <div style={{ display: 'flex', gap: d.plateGap, justifyContent: 'center', width: row.w, maxWidth: '100%', margin: ri > 0 && !busDrawn ? '14px auto 0' : '0 auto' }}>
                {row.idx.map((i) => {
                  const pl = model.plates[i]
                  return (
                    <Plate
                      key={pl.tree.id}
                      plate={pl}
                      trace={traces[i]}
                      d={d}
                      wide={wide}
                      accent={accent}
                      graph={graph}
                      evaluation={evaluation}
                      level={level}
                      stepOf={stepOf}
                      targetId={targetId}
                      selectedId={selectedHere}
                      hoverId={hoverId}
                      related={related}
                      briefId={briefId}
                      laminaId={`lamina-${pl.tree.id.replace(/[^a-z0-9]+/gi, '-')}`}
                      laminaOpen={props.openLaminas.has(pl.tree.id)}
                      onToggleLamina={() => props.onToggleLamina(pl.tree.id)}
                      onHover={setHoverId}
                      onSelect={(id) => onSelect(selectedHere === id ? null : id)}
                    />
                  )
                })}
              </div>
              {ri === briefAfterRow && brief}
            </Fragment>
          ))}
          {props.plateNote}
        </>
      )}

      {allChips.length > 0 && (
        <ul aria-label="Requisitos fuera de estas láminas" style={{ listStyle: 'none', margin: '10px auto 0', maxWidth: Math.max(rowW, 320), display: 'flex', flexDirection: 'column', gap: 3 }}>
          {allChips.map((ch) => (
            <li key={ch.childId} style={{ fontSize: fs.xs, color: c.muted, lineHeight: 1.4 }}>
              <span style={{ fontWeight: 650, color: c.text }}>{graph.byId.get(ch.childId)?.name}</span> también requiere: {ch.text}
            </li>
          ))}
        </ul>
      )}

      {briefAfterRow < 0 && brief}

      {openPlates.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {/* solid card (never translucent): this row can scroll right up to the fixed top bar / sticky
              mode bar, and must never read as a second, half-legible header ghosting behind them */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, margin: '0 auto 8px',
              maxWidth: Math.max(rowW, 320), background: c.s1, border: `1px solid ${c.border}`, borderRadius: radius.sm,
              padding: '6px 10px 6px 12px',
            }}
          >
            <p style={{ fontSize: fs.sm, color: c.muted, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {plural(openPlates.length, 'Lámina abierta', 'Láminas abiertas')}: <strong style={{ color: c.text }}>{openPlates.map((p) => p.fullLabel).join(', ')}</strong>
            </p>
            <button
              type="button"
              className="ui-link"
              onClick={() => props.onCloseLaminas(openPlates.map((p) => p.tree.id))}
              style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: c.brand, fontSize: fs.sm, fontWeight: 650, minHeight: 36, padding: '0 2px' }}
            >
              Plegar {openPlates.length > 1 ? 'todas' : 'lámina'}
            </button>
          </div>
          {openPlates.map((pl) => (
            <TalentLamina
              key={pl.tree.id}
              id={`lamina-${pl.tree.id.replace(/[^a-z0-9]+/gi, '-')}`}
              plate={pl}
              graph={graph}
              evaluation={evaluation}
              level={level}
              contentW={contentW}
              accent={accent}
              edgeStatus={edgeStatus}
              stepOf={stepOf}
              targetId={targetId}
              onOpen={props.onOpenSheet}
              onClose={() => props.onToggleLamina(pl.tree.id)}
              surgeRank={props.surgeRank}
              headingLevel={subLevel}
            />
          ))}
        </div>
      )}
      {props.state && otherDefs.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Disclosure
            title="Otros poderes"
            summary={`${otherDefs.length} ${plural(otherDefs.length, 'poder', 'poderes')} de tu camino que no tienes · solo consulta`}
            icon={<MetalMark poderId={`${otherDefs[0].arte}:${otherDefs[0].metal}`} size={20} />}
            headingLevel={subLevel}
          >
            <OtrosPoderes atlas={props} defs={otherDefs} state={props.state} />
          </Disclosure>
        </div>
      )}
      {props.outro}
    </AtlasRoot>
  )
}

// ── «Otros poderes»: the plates of the powers the character lacks, in the Disclosure of the Investida path ──────────

/**
 * Mounted only while the Disclosure is open: builds a second graph with the powers added to the character's own and evaluates it against the
 * same state, then draws their plates with the atlas itself (variant 'otros': no heading, no key box, no bus, read-only brief card).
 * The Disclosure panel keeps 17 px of padding on each side: the plates are laid out for that narrower column.
 */
function OtrosPoderes({ atlas, defs, state }: { atlas: AtlasProps; defs: PoderDef[]; state: TalentState }) {
  const { graph, model } = atlas
  const other = useMemo(() => {
    const options = { ...graph.options, poderes: [...(graph.options.poderes ?? []), ...defs.map((p) => ({ arte: p.arte, metal: p.metal }))] }
    const exGraph = buildTalentGraph(options, graph.rules)
    return { graph: exGraph, evaluation: evaluate(exGraph, state), model: buildOtherPowersModel(exGraph, defs, `otros:${model.id}`, model.color) }
  }, [graph, defs, state, model.id, model.color])
  return (
    <PathAtlas
      {...atlas}
      variant="otros"
      model={other.model}
      graph={other.graph}
      evaluation={other.evaluation}
      contentW={atlas.contentW - 34}
      headingLevel={3}
      explore={false}
      keyExtra={undefined}
      intro={undefined}
      plateNote={undefined}
      outro={undefined}
      keyOwnedNote={undefined}
    />
  )
}

// ── Key talent box (double gold frame) ───────────────────────────────────────

function KeyBox({ node, model, evaluation, level, accent, wide, explore, selected, briefId, onSelect, onLearn, busy, extra, ownedNote, step, target, onHover }: {
  node: TalentNode
  model: PathModel
  evaluation: TalentEvaluation
  level: number
  accent: Accent
  wide: boolean
  explore: boolean
  selected: boolean
  briefId: string
  onSelect: () => void
  onLearn: () => void
  busy: boolean
  extra?: ReactNode
  ownedNote?: string
  step?: number
  target?: boolean
  onHover: (id: string | null) => void
}) {
  const ev = evaluation.nodes.get(node.id)
  const mark = cellMark(ev, level, node.autoGranted)
  const principalOf = `principal de ${model.title}`
  const levelGates = (ev?.gates ?? []).filter((g) => g.kind === 'level')
  let status: ReactNode
  const ico: CSSProperties = { display: 'inline', verticalAlign: '-2px', marginRight: 4 }
  if (mark.kind === 'learned' || mark.kind === 'elsewhere') {
    const why = ownedNote ?? (node.autoGranted
      ? model.kind === 'cantor' || model.kind === 'ascendencia' ? 'ascendencia' : 'tu talento de nivel 1'
      : model.kind === 'heroico' || model.kind === 'caminoInvestido' ? 'has entrado en este camino' : 'aprendido')
    status = (
      <span style={{ color: accent.fg, fontWeight: 650 }}>
        <Check size={14} strokeWidth={3} aria-hidden style={ico} />
        {node.autoGranted ? 'Concedido' : 'Aprendido'} · {why}
      </span>
    )
  } else if (mark.kind === 'available') {
    status = (
      <span style={{ color: accent.fg, fontWeight: 650 }}>
        <Plus size={14} strokeWidth={3} aria-hidden style={ico} />
        Disponible
        <span style={{ color: c.muted, fontWeight: 600 }}>
          {levelGates.map((g) => (
            <span key={g.clauseIndex} style={{ whiteSpace: 'nowrap' }}>
              {' · '}Nv {g.kind === 'level' ? g.min : ''}+{' '}
              <Check size={12} strokeWidth={3} aria-label="cumplido" style={{ ...ico, marginRight: 0, color: tone.esmeralda.fg }} />
            </span>
          ))}
          {' · '}cuesta 1 talento{explore && model.kind === 'heroico' ? ' · entras en el camino' : ''}
        </span>
      </span>
    )
  } else {
    status = (
      <span style={{ color: c.muted, fontWeight: 600 }}>
        <Hourglass size={13} aria-hidden style={ico} />
        {stateWords(mark, level)}{ev?.missing.length ? ` · Falta: ${ev.missing.join(' · ')}` : ''}
      </span>
    )
  }
  const label = `${node.name} (${principalOf}), ${ACTIVATION[node.activation].label}. ${stateWords(mark, level)}.${ev?.missing.length && mark.kind === 'locked' ? ` Falta: ${ev.missing.join('; ')}.` : ''}${target ? ' Tu objetivo.' : step ? ` Paso ${step} de la ruta.` : ''}`
  const frame: CSSProperties = {
    position: 'relative', margin: '0 auto', maxWidth: wide ? 480 : 420, background: c.s1,
    border: '1.5px solid var(--gold-ornament)', borderRadius: 4, padding: wide ? '10px 14px' : '8px 10px',
    boxShadow: `inset 0 0 0 2.5px var(--surface-1), inset 0 0 0 3.5px var(--gold-border), ${shadow[1]}`,
    outline: selected ? `2.5px solid ${c.text}` : undefined, outlineOffset: 2,
  }
  return (
    <div style={frame}>
      {(step || target) && <StepBadge step={step} target={target} />}
      <button
        type="button"
        id={cellDomId(node.id)}
        aria-label={label}
        aria-expanded={selected}
        aria-controls={selected ? briefId : undefined}
        onClick={onSelect}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(node.id)}
        onBlur={() => onHover(null)}
        className="ui-row"
        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer', textAlign: 'left', color: c.text, borderRadius: 4 }}
      >
        <ActIcon type={node.activation} size={11} />
        <span style={{ fontFamily: font.display, fontVariantCaps: 'all-small-caps', fontSize: wide ? 19 : 17, fontWeight: 650, letterSpacing: '0.03em', lineHeight: 1.1, color: c.text }}>
          {node.name}{' '}
          <span style={{ fontSize: wide ? 16 : 15, fontWeight: 600, color: c.muted }}>({principalOf})</span>
        </span>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: fs.xs, flexWrap: 'wrap' }}>
        <span style={{ flex: '1 1 160px', minWidth: 0, lineHeight: 1.45 }}>{status}</span>
        {mark.kind === 'available' && (
          <Button size="sm" variant="primary" icon={<Plus size={15} aria-hidden />} onClick={onLearn} loading={busy} aria-label={`Aprender ${node.name}`}>
            Aprender
          </Button>
        )}
        {extra}
      </div>
    </div>
  )
}

// ── Plate: band + edges + cells (role=group, roving tabindex, arrow keys) ─────

function Plate({ plate, trace, d, wide, accent, graph, evaluation, level, stepOf, targetId, selectedId, hoverId, related, briefId, laminaId, laminaOpen, onToggleLamina, onHover, onSelect }: {
  plate: PlateModel
  trace: PlateTrace
  d: Dims
  wide: boolean
  accent: Accent
  graph: TalentGraph
  evaluation: TalentEvaluation
  level: number
  stepOf: ReadonlyMap<string, number>
  targetId: string | null
  selectedId: string | null
  hoverId: string | null
  related: { parents: Set<string>; children: Set<string> } | null
  briefId: string
  laminaId: string
  laminaOpen: boolean
  onToggleLamina: () => void
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
}) {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const { box } = trace
  const owned = plate.order.filter((id) => { const s = evaluation.nodes.get(id)?.state; return s === 'learned' || s === 'learnedElsewhere' }).length
  const avail = plate.order.filter((id) => evaluation.nodes.get(id)?.state === 'available').length
  const activeIdx = Math.min(active, Math.max(0, plate.order.length - 1))
  // long names in the phone miniature: tighter letters and no chevron (the open state is the ring)
  const longLabel = plate.label.length > (plate.poderId ? 8 : 11)

  const move = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const cur = plate.pos.get(plate.order[i])
    if (!cur) return
    const cells = plate.order.map((id, idx) => ({ idx, ...plate.pos.get(id)! }))
    let target = -1
    const pick = (list: typeof cells, score: (x: (typeof cells)[number]) => number) => {
      let best = -1, bestScore = Infinity
      for (const x of list) { const s = score(x); if (s < bestScore) { bestScore = s; best = x.idx } }
      return best
    }
    switch (e.key) {
      case 'ArrowRight': target = pick(cells.filter((x) => x.row === cur.row && x.col > cur.col), (x) => x.col); if (target < 0 && i + 1 < cells.length) target = i + 1; break
      case 'ArrowLeft': target = pick(cells.filter((x) => x.row === cur.row && x.col < cur.col), (x) => -x.col); if (target < 0 && i > 0) target = i - 1; break
      case 'ArrowDown': target = pick(cells.filter((x) => x.row > cur.row), (x) => (x.row - cur.row) * 10 + Math.abs(x.col - cur.col)); break
      case 'ArrowUp': target = pick(cells.filter((x) => x.row < cur.row), (x) => (cur.row - x.row) * 10 + Math.abs(x.col - cur.col)); break
      case 'Home': target = 0; break
      case 'End': target = cells.length - 1; break
      default: return
    }
    e.preventDefault()
    if (target >= 0) { setActive(target); refs.current[target]?.focus() }
  }

  return (
    <div
      role="group"
      aria-label={`${plate.fullLabel}: ${owned} de ${plate.order.length} tuyos${avail ? `, ${avail} ${plural(avail, 'disponible', 'disponibles')}` : ''}`}
      style={{ position: 'relative', width: box.width, height: box.height, flexShrink: 0 }}
    >
      <button
        type="button"
        aria-expanded={laminaOpen}
        aria-controls={laminaOpen ? laminaId : undefined}
        aria-label={`Lámina ${plate.fullLabel}`}
        title={plate.fullLabel}
        onClick={onToggleLamina}
        style={{
          position: 'absolute', left: 0, top: 0, width: box.width, height: d.bandH, borderRadius: 3, border: 'none',
          background: BAND_BG, color: BAND_FG, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
          padding: '0 4px', cursor: 'pointer', fontFamily: font.ui, fontSize: wide ? fs.xs : fs.eyebrow, fontWeight: 750,
          letterSpacing: wide ? '0.08em' : '0.04em', textTransform: 'uppercase', zIndex: 1,
          boxShadow: laminaOpen ? `0 0 0 2px var(--bg), 0 0 0 3.5px ${c.text}` : undefined,
        }}
      >
        {plate.poderId && <MetalMark poderId={plate.poderId} size={wide ? 13 : 11} />}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, letterSpacing: longLabel ? 0 : undefined }}>{plate.label}</span>
        {!(longLabel && !wide) && <ChevronDown size={wide ? 13 : 11} strokeWidth={2.75} aria-hidden style={{ flexShrink: 0, transform: laminaOpen ? 'rotate(180deg)' : undefined }} />}
      </button>

      {plate.order.length === 0 ? (
        <p style={{ position: 'absolute', left: d.margin, right: d.margin, top: d.bandH + d.topGap, bottom: d.bottomPad, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: fs.xs, color: c.muted, border: `1px dashed ${c.borderBright}`, borderRadius: 6, padding: 6, lineHeight: 1.35 }}>
          Pendiente de transcribir
        </p>
      ) : (
        <EdgeLayer edges={trace.edges} joins={trace.joins} width={box.width} height={box.height} accent={accent} widths={d} hlId={hoverId} />
      )}

      {plate.order.map((id, i) => {
        const node = graph.byId.get(id)
        const r = trace.rects.get(id)
        if (!node || !r) return null
        const ev = evaluation.nodes.get(id)
        const mark = cellMark(ev, level, node.autoGranted)
        const step = stepOf.get(id)
        const target = targetId === id
        const sel = selectedId === id
        const isHover = hoverId === id
        const isRel = !!related && (related.parents.has(id) || related.children.has(id))
        const look: CSSProperties =
          mark.kind === 'learned' ? { background: accent.wash(15), border: `1.5px solid ${accent.borderStrong}` }
          : mark.kind === 'elsewhere' ? { background: accent.wash(6), border: `1.5px dotted ${accent.borderStrong}` }
          : mark.kind === 'available' ? { background: c.s1, border: `1.5px dashed ${accent.border}` }
          : mark.badge === 'meta' ? META_LOCKED
          : mark.badge === 'nivel' ? { background: c.s3, border: `1px solid ${c.borderBright}` }
          : { background: c.s1, border: `1px solid ${c.borderBright}` }
        const ring = sel ? `0 0 0 2.5px ${c.text}` : isHover ? `0 0 0 2px ${c.text}` : isRel ? `0 0 0 2px ${c.muted}` : step || target ? `0 0 0 2px ${c.brand}` : undefined
        const nameColour = mark.kind === 'learned' ? accent.fg : mark.kind === 'locked' ? c.muted : c.text
        return (
          <button
            key={id}
            ref={(el) => { refs.current[i] = el }}
            type="button"
            id={cellDomId(id)}
            tabIndex={i === activeIdx ? 0 : -1}
            aria-label={cellLabel(node, mark, ev?.missing ?? [], level, graph, step, target)}
            aria-expanded={sel}
            aria-controls={sel ? briefId : undefined}
            title={wide ? undefined : node.name}
            onClick={() => onSelect(id)}
            onKeyDown={(e) => move(e, i)}
            onFocus={() => { setActive(i); onHover(id) }}
            onBlur={() => onHover(null)}
            onMouseEnter={() => onHover(id)}
            onMouseLeave={() => onHover(null)}
            style={{
              position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, zIndex: 1, cursor: 'pointer',
              borderRadius: wide ? 8 : 6, color: c.text, font: 'inherit', boxShadow: ring,
              display: 'flex', flexDirection: wide ? 'column' : 'row', alignItems: wide ? 'stretch' : 'center', justifyContent: wide ? 'flex-start' : 'center',
              gap: wide ? 2 : 2, padding: wide ? '4px 4px 4px 5px' : 0, textAlign: 'left', fontVariantNumeric: 'tabular-nums',
              ...look,
            }}
          >
            {(step || target) && <StepBadge step={step} target={target} />}
            {wide ? (
              <>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, minHeight: 18, pointerEvents: 'none' }}>
                  <ActIcon type={node.activation} size={10} />
                  <CellMarkView mark={mark} accent={accent} compact={false} />
                </span>
                <span
                  style={{
                    pointerEvents: 'none', fontFamily: font.display, fontSize: 13, fontWeight: 620, lineHeight: 1.12, letterSpacing: '-0.005em', color: nameColour, hyphens: 'auto', overflowWrap: 'break-word',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}
                >
                  {node.name}
                </span>
              </>
            ) : (
              <span style={{ display: 'contents', pointerEvents: 'none' }}><CellMarkView mark={mark} accent={accent} compact /></span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Brief card (inline, under the map) ───────────────────────────────────────

function BriefCard({ id, node, graph, evaluation, level, accent, caretLeft, isGoal, explore, readOnly, busy, onClose, onOpenSheet, onLearn, onSetGoal, onRemoveGoal, headingLevel }: {
  id: string
  node: TalentNode
  graph: TalentGraph
  evaluation: TalentEvaluation
  level: number
  accent: Accent
  caretLeft: string
  isGoal: boolean
  explore: boolean
  /** talents of a power the character lacks («Otros poderes»): nothing to learn, no sheet, no goal */
  readOnly: boolean
  busy: boolean
  onClose: () => void
  onOpenSheet: () => void
  onLearn: () => void
  onSetGoal: () => void
  onRemoveGoal: () => void
  headingLevel: 3 | 4
}) {
  const Hn = `h${headingLevel}` as 'h3' | 'h4'
  const ev = evaluation.nodes.get(node.id)
  const mark = cellMark(ev, level, node.autoGranted)
  const words = stateWords(mark, level)
  const owned = mark.kind === 'learned' || mark.kind === 'elsewhere'
  const StateIcon = owned ? Check : mark.kind === 'available' ? Plus : Hourglass
  const stateColour = owned || mark.kind === 'available' ? accent.fg : c.text
  let action: ReactNode = null
  if (mark.kind === 'available') {
    action = <Button variant="primary" size="md" icon={<Plus size={16} aria-hidden />} onClick={onLearn} loading={busy} style={{ flex: 1 }}>Aprender</Button>
  } else if (mark.kind === 'locked' && mark.distance !== null) {
    action = isGoal
      ? <Button variant="secondary" size="md" icon={<X size={16} aria-hidden />} onClick={onRemoveGoal} aria-haspopup="dialog" style={{ flex: 1 }}>Quitar objetivo</Button>
      : <Button variant="primary" size="md" icon={<Target size={16} aria-hidden />} onClick={onSetGoal} style={{ flex: 1 }}>Fijar objetivo</Button>
  }
  return (
    <div
      id={id}
      role="region"
      aria-label={`Resumen de ${node.name}`}
      className="pop-in"
      onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }}
      style={{ position: 'relative', marginTop: 14, background: c.s1, border: `1.5px solid ${c.borderStrong}`, borderRadius: radius.md, padding: '10px 14px 14px', boxShadow: shadow[2] }}
    >
      <span aria-hidden style={{ position: 'absolute', top: -8, left: `calc(${caretLeft} - 7px)`, width: 14, height: 14, background: c.s1, borderLeft: `1.5px solid ${c.borderStrong}`, borderTop: `1.5px solid ${c.borderStrong}`, transform: 'rotate(45deg)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ActIcon type={node.activation} size={11} />
        <Hn style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 650, lineHeight: 1.2, color: c.text, flex: 1, minWidth: 0 }}>{node.name}</Hn>
        <IconButton label="Cerrar resumen" size={40} onClick={onClose} style={{ marginRight: -8 }}>
          <X size={18} aria-hidden />
        </IconButton>
      </div>
      <p style={{ fontSize: fs.xs + 0.5, color: c.muted, marginTop: 2, lineHeight: 1.4 }}>
        {sourceOf(node, graph)} · {ACTIVATION[node.activation].label}{node.autoGranted ? ' · concedido' : ''}
      </p>
      <p style={{ fontSize: fs.sm + 1, color: c.text, marginTop: 6, lineHeight: 1.5 }}>{summaryOf(node, graph.rules.summaries)}</p>
      <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.sm, marginTop: 8, color: stateColour, fontWeight: 650 }}>
        <StateIcon size={15} strokeWidth={owned || mark.kind === 'available' ? 3 : 2.25} aria-hidden style={{ flexShrink: 0 }} />
        {words}
        {explore && node.isKey && mark.kind === 'available' && <span style={{ color: c.muted, fontWeight: 500 }}>· cuesta 1 talento</span>}
      </p>
      {mark.kind === 'locked' && ev && ev.missing.length > 0 && (
        <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 4, lineHeight: 1.45 }}>
          <span style={{ fontWeight: 650, color: c.text }}>Falta:</span> {ev.missing.join(' · ')}
        </p>
      )}
      {!readOnly && (
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <Button variant="secondary" size="md" onClick={onOpenSheet} aria-haspopup="dialog" style={{ flex: 1 }}>Ficha</Button>
          {action}
        </div>
      )}
    </div>
  )
}
