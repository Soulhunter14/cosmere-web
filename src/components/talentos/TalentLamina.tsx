/**
 * TalentLamina — the readable plate of one specialty / spren bond / surge, opened from its gold band.
 * Two lanes of cards at the book's grid positions: official activation icon, full name, the non-talent
 * requirement in italics with ✓/✗, the state in words and the route step tab. Same fixed-geometry
 * tracer as the map (talentMap.ts), with the lámina profile.
 */
import { useMemo, type CSSProperties, type ReactNode } from 'react'
import { Check, ChevronUp, Hourglass, Plus, Target, X } from 'lucide-react'
import { IconButton } from '../ui'
import { SurgeIcon } from '../GameIcons'
import { c, font, fs, radius, shadow, titleText, tone } from '../../theme'
import { POTENCIAS } from '../../data/potencias'
import type { Gate, TalentEvaluation, TalentGraph } from '../../lib/talentGraph'
import {
  WIDE_MIN, cellMark, firstSentence, laminaDims, plural, requiresText, stateWords, summaryOf, tracePlate,
  type EdgeStatusFn, type PlateModel,
} from './talentMap'
import { ACTIVATION, BAND_BG, BAND_FG, type Accent } from './talentStyle'
import { ActIcon, DottedCheck, EdgeLayer, IdealGlyph } from './MapPieces'

/** Non-talent requirements of a card (the talent part is the lines), plus talents outside this plate. */
function gateBits(gates: Gate[], plate: PlateModel): { key: string; ok: boolean | 'dj'; content: ReactNode }[] {
  const out: { key: string; ok: boolean | 'dj'; content: ReactNode }[] = []
  for (const g of gates) {
    const ok = g.status === 'met' ? true : g.status === 'confirm' ? 'dj' as const : false
    if (g.kind === 'talent') {
      const inside = g.options.some((o) => o.nodeId && (plate.pos.has(o.nodeId) || o.nodeId === plate.tree.keyNodeId))
      if (!inside) out.push({ key: `t${g.clauseIndex}`, ok, content: <>{g.options.map((o) => o.name).join(' o ')}</> })
    } else if (g.kind === 'skill') {
      // «tienes N» lives in the brief card / ficha (gate.text already carries it); the lámina card only
      // has room for the skill, its threshold and — when relevant — the level it's guaranteed by.
      const capNote = g.status !== 'met' && g.capped ? ` · Nv ${g.capLevel}` : ''
      out.push({ key: `s${g.clauseIndex}`, ok, content: <>{g.skill} {g.min}{capNote}</> })
    } else if (g.kind === 'level') {
      out.push({ key: `l${g.clauseIndex}`, ok, content: <>Nivel {g.min}</> })
    } else if (g.kind === 'ideal') {
      out.push({ key: `i${g.clauseIndex}`, ok, content: <><IdealGlyph size={11} /> Jurar el {g.name.replace(' Ideal', '').toLowerCase()} Ideal</> })
    } else if (g.kind === 'story') {
      out.push({ key: `h${g.clauseIndex}`, ok, content: <>DJ: {g.condition}</> })
    } else if (g.kind === 'ancestry') {
      out.push({ key: `a${g.clauseIndex}`, ok, content: <>Ascendencia cantora</> })
    } else {
      out.push({ key: `u${g.clauseIndex}`, ok, content: <>{g.label}</> })
    }
  }
  return out
}

/**
 * Inline mark: a normal (non-flex) span so it wraps as part of the text and never separates from it.
 * `display: inline` overrides Tailwind's preflight (`svg { display: block }`) — without it the icon
 * forces a block break in the middle of the run, fragmenting one short line into three.
 */
function OkMark({ ok }: { ok: boolean | 'dj' }) {
  if (ok === 'dj') return <span style={{ fontStyle: 'normal', fontWeight: 750, fontSize: fs.eyebrow, color: tone.topacio.fg }}>DJ</span>
  return ok
    ? <Check size={12} strokeWidth={3} aria-hidden style={{ display: 'inline', color: tone.esmeralda.fg, verticalAlign: -1.5 }} />
    : <X size={12} strokeWidth={3} aria-hidden style={{ display: 'inline', color: tone.rubi.fg, verticalAlign: -1.5 }} />
}

export function TalentLamina({ id, plate, graph, evaluation, level, contentW, accent, edgeStatus, stepOf, targetId, onOpen, onClose, surgeRank, headingLevel = 3 }: {
  id: string
  plate: PlateModel
  graph: TalentGraph
  evaluation: TalentEvaluation
  level: number
  contentW: number
  accent: Accent
  edgeStatus: EdgeStatusFn
  stepOf: ReadonlyMap<string, number>
  targetId: string | null
  onOpen: (nodeId: string) => void
  onClose: () => void
  surgeRank?: (surge: string) => number
  headingLevel?: 3 | 4
}) {
  const Hn = `h${headingLevel}` as 'h3' | 'h4'
  const wide = contentW >= WIDE_MIN
  // the plates of 3 lanes (the singer) and of 4 (the nacidoble path): narrower cards over the whole lámina width
  const d = useMemo(() => {
    const base = laminaDims(contentW)
    if (plate.cols <= 2) return base
    const W = Math.min(contentW, wide ? 648 : 420)
    return { ...base, channel: 12, cellW: Math.floor((W - 2 * base.margin - 12 * (plate.cols - 1)) / plate.cols) }
  }, [contentW, plate.cols, wide])
  const lam = useMemo(() => tracePlate(plate, graph, d, edgeStatus), [plate, graph, d, edgeStatus])
  const { box } = lam
  const owned = plate.order.filter((nid) => { const s = evaluation.nodes.get(nid)?.state; return s === 'learned' || s === 'learnedElsewhere' }).length
  const avail = plate.order.filter((nid) => evaluation.nodes.get(nid)?.state === 'available').length
  const pot = plate.kind === 'potencia' ? POTENCIAS.find((p) => p.name === plate.tree.section) : undefined
  const rank = pot && surgeRank ? surgeRank(pot.name) : 0
  const cardName: CSSProperties = {
    fontFamily: font.display, fontSize: wide ? 16 : 15, fontWeight: 650, lineHeight: 1.15, color: c.text,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere',
  }
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="fade-in" style={{ width: box.width, maxWidth: '100%', margin: '0 auto 18px' }}>
      {pot && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: c.s1, border: `1px solid ${c.borderBright}`, borderRadius: radius.md, padding: '10px 12px', marginBottom: 10, boxShadow: shadow[1] }}>
          <SurgeIcon surge={pot.name} size={30} style={{ color: accent.fg, flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 650, color: c.text }}>{pot.name}</span>
              <span style={{ fontSize: fs.xs, color: c.muted }}>potencia · {pot.atributo}</span>
            </p>
            <p style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: fs.sm, color: c.muted, lineHeight: 1.45, marginTop: 4 }}>
              <ActIcon type={pot.costoBase} size={10} style={{ marginTop: 1 }} />
              <span>
                <strong style={{ color: c.text }}>Poder base:</strong> {firstSentence(pot.descripcion)}{' '}
                Rango {rank || '—'}. El rango 1 es gratis al jurar el Primer Ideal.
              </span>
            </p>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: BAND_BG, color: BAND_FG, borderRadius: 4, padding: '4px 4px 4px 12px', minHeight: 44 }}>
        {pot && <SurgeIcon surge={pot.name} size={20} style={{ color: BAND_FG }} />}
        <Hn id={`${id}-t`} style={{ ...titleText, fontSize: wide ? 18 : 17, color: BAND_FG, margin: 0, flex: 1, minWidth: 0 }}>
          {plate.fullLabel}
        </Hn>
        <span style={{ fontSize: fs.xs + 0.5, fontWeight: 700, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
          {owned}/{plate.order.length} · {avail} {plural(avail, 'disponible', 'disponibles')}
        </span>
        <IconButton label={`Plegar la lámina ${plate.fullLabel}`} size={40} onClick={onClose} style={{ color: BAND_FG }}>
          <ChevronUp size={18} aria-hidden />
        </IconButton>
      </div>
      <div style={{ position: 'relative', width: box.width, height: box.height, maxWidth: '100%' }}>
        {plate.order.length === 0 ? (
          <p style={{ padding: 16, fontSize: fs.sm, color: c.muted, textAlign: 'center' }}>Árbol pendiente de transcribir desde el libro.</p>
        ) : (
          <EdgeLayer edges={lam.edges} joins={lam.joins} width={box.width} height={box.height} accent={accent} widths={d} />
        )}
        {plate.order.map((nid) => {
          const node = graph.byId.get(nid)
          const r = lam.rects.get(nid)
          if (!node || !r) return null
          const ev = evaluation.nodes.get(nid)
          const mark = cellMark(ev, level, node.autoGranted)
          const step = stepOf.get(nid)
          const target = targetId === nid
          const bits = gateBits(ev?.gates ?? [], plate)
          // the card's italics already carry «· Nv 6»: keep the state short
          const words = mark.kind === 'locked' && mark.distance !== null ? `A ${mark.distance} ${plural(mark.distance, 'talento', 'talentos')}` : stateWords(mark, level)
          const look: CSSProperties =
            mark.kind === 'learned' ? { background: accent.wash(14), border: `1.5px solid ${accent.borderStrong}` }
            : mark.kind === 'elsewhere' ? { background: accent.wash(6), border: `1.5px dotted ${accent.borderStrong}` }
            : mark.kind === 'available' ? { background: c.s1, border: `1.5px dashed ${accent.border}` }
            : { background: mark.badge === 'nivel' ? c.s2 : c.s1, border: `1px solid ${c.borderBright}` }
          const onRoute = !!step || target
          const req = requiresText(node)
          const label = `${node.name}, ${ACTIVATION[node.activation].label}. ${words}.${ev?.missing.length && mark.kind === 'locked' ? ` Falta: ${ev.missing.join('; ')}.` : ''}${req ? ` Requiere: ${req}.` : ''}${target ? ' Tu objetivo.' : step ? ` Paso ${step} de la ruta.` : ''} Abre la ficha.`
          return (
            <div key={nid} style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, zIndex: 1 }}>
              <button
                type="button"
                aria-label={label}
                aria-haspopup="dialog"
                onClick={() => onOpen(nid)}
                className="ui-card--interactive"
                style={{
                  width: '100%', height: '100%', borderRadius: radius.sm, cursor: 'pointer', font: 'inherit', color: c.text,
                  display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4, padding: '9px 10px 8px', textAlign: 'left',
                  overflow: 'hidden', boxShadow: onRoute ? `0 0 0 2px ${c.brand}` : shadow[1], ...look,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <ActIcon type={node.activation} size={10} style={{ marginTop: 1 }} />
                  <span style={cardName}>{node.name}</span>
                </span>
                {bits.length > 0 && (
                  // up to ~4 stacked clauses (talent + skill + level + DJ condition can all land on one
                  // node, e.g. the radiant Ideal cards): keep in sync with laminaDims()'s cellH
                  <span style={{ display: 'block', fontSize: fs.xs + 0.5, fontStyle: 'italic', color: c.muted, lineHeight: 1.35, maxHeight: 68, overflow: 'hidden', flexShrink: 0 }}>
                    {bits.map((b, i) => (
                      // a plain inline span: the mark wraps together with its own clause's last word
                      // (non-breaking space) instead of floating on its own flex line
                      <span key={b.key}>
                        {i > 0 && ' · '}
                        {b.content}
                        {' '}<OkMark ok={b.ok} />
                      </span>
                    ))}
                  </span>
                )}
                {wide && (
                  <span style={{ fontSize: fs.xs + 0.5, color: c.muted, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: bits.length ? 2 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {summaryOf(node, graph.rules.summaries)}
                  </span>
                )}
                <span style={{ marginTop: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: fs.xs, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: mark.kind === 'learned' || mark.kind === 'elsewhere' || mark.kind === 'available' ? accent.fg : c.text }}>
                  {mark.kind === 'learned' ? <Check size={13} strokeWidth={3} aria-hidden />
                    : mark.kind === 'elsewhere' ? <DottedCheck size={13} />
                    : mark.kind === 'available' ? <Plus size={13} strokeWidth={3} aria-hidden />
                    : <Hourglass size={12} aria-hidden style={{ color: c.muted }} />}
                  {words}
                </span>
              </button>
              {onRoute && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute', top: -9, right: 10, zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: 3,
                    background: c.brand, color: c.onBrand, fontSize: fs.eyebrow, fontWeight: 800, letterSpacing: '0.06em',
                    padding: '2px 7px', borderRadius: radius.full, textTransform: 'uppercase', lineHeight: 1.2,
                  }}
                >
                  {target ? <><Target size={11} strokeWidth={3} /> Objetivo</> : `Paso ${step}`}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
