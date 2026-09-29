/**
 * TalentSheet — the full talent card (replaces the old renderDrawer): badges, effect, state, analysed
 * requirements with ✓/✗/DJ, «Cómo llegar» (route steps, Aprender on the first one, «o» branch selector),
 * «Desbloquea», «También aparece en», «Mejorado por», singer forms, «También se olvidarán» and the
 * book's errata note. Footer: Cerrar + one action (Aprender / Olvidar / Fijar objetivo / Quitar objetivo).
 */
import { useMemo, useState, type ReactNode } from 'react'
import { BookOpen, Check, CheckCircle2, Hourglass, Plus, Target, X, XCircle } from 'lucide-react'
import { Button, Segmented, Sheet } from '../ui'
import { TalentActivation } from '../TalentActivation'
import { c, eyebrow, font, fs, pill, radius, tone } from '../../theme'
import {
  cascadeRemove, cheapestRoute, type Gate, type TalentEvaluation, type TalentGraph, type TalentState,
} from '../../lib/talentGraph'
import { cellMark, plural, sourceOf, stateWords } from './talentMap'
import { accentOf } from './talentStyle'
import { DottedCheck } from './MapPieces'
import { FormaCard } from './FormaPicker'

function GateIcon({ g }: { g: Gate }) {
  if (g.status === 'confirm')
    return <span style={{ ...pill(tone.topacio), padding: '0 6px', fontSize: fs.eyebrow, fontWeight: 800, flexShrink: 0 }}>DJ</span>
  return g.status === 'met'
    ? <CheckCircle2 size={17} aria-label="Cumplido" style={{ color: tone.esmeralda.fg, flexShrink: 0 }} />
    : <XCircle size={17} aria-label="No cumplido" style={{ color: tone.rubi.fg, flexShrink: 0 }} />
}

function gateMain(g: Gate): string {
  switch (g.kind) {
    case 'talent': return g.options.map((o) => o.name).join(' o ')
    case 'ideal': return `${g.name} jurado`
    case 'skill': return `${g.skill} ${g.min}`
    case 'level': return `Nivel ${g.min}`
    case 'story': return g.condition
    default: return g.label
  }
}
function gateSub(g: Gate): string | null {
  switch (g.kind) {
    case 'talent': return g.options.length > 1 ? `basta uno${g.status === 'met' ? '' : ' · aún no tienes ninguno'}` : g.status === 'met' ? null : 'aún no lo tienes'
    case 'ideal': return g.status === 'met' ? null : g.learned ? 'aprendido, falta jurarlo (meta con la DJ)' : 'aún no lo tienes'
    case 'skill': { const i = g.text.indexOf(': '); return i >= 0 ? g.text.slice(i + 2) : null }
    case 'level': return g.status === 'met' ? null : `tienes ${g.current}`
    case 'story': return 'condición de historia: la confirmas con la DJ al aprenderlo'
    default: return g.status === 'met' ? null : g.text
  }
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 style={{ ...eyebrow, color: c.gold, fontFamily: font.ui, marginBottom: 8 }}>{title}</h3>
      {children}
    </section>
  )
}

const linkBtn = { background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: c.brand, font: 'inherit', fontWeight: 650, textAlign: 'left' as const }

export function TalentSheet({
  nodeId, graph, evaluation, state, level, isGoal, initialChoices, busy,
  onClose, onOpenNode, onLearn, onForget, onSetGoal, onRemoveGoal, onChoicesChange, onActivateForma,
}: {
  nodeId: string
  graph: TalentGraph
  evaluation: TalentEvaluation
  state: TalentState
  level: number
  isGoal: boolean
  initialChoices: Readonly<Record<string, string>>
  busy: boolean
  onClose: () => void
  onOpenNode: (id: string) => void
  onLearn: (id: string) => void
  onForget: (id: string) => void
  onSetGoal: (id: string, choices: Record<string, string>) => void
  onRemoveGoal: () => void
  onChoicesChange: (choices: Record<string, string>) => void
  onActivateForma: (nombre: string) => void
}) {
  const node = graph.byId.get(nodeId)
  const [choices, setChoices] = useState<Record<string, string>>(() => ({ ...initialChoices }))
  const ev = evaluation.nodes.get(nodeId)
  const mark = cellMark(ev, level, node?.autoGranted)
  const owned = mark.kind === 'learned' || mark.kind === 'elsewhere'
  const route = useMemo(() => (graph.byId.has(nodeId) && !owned ? cheapestRoute(graph, state, nodeId, { choices }) : null), [graph, state, nodeId, choices, owned])
  const cascade = useMemo(() => {
    const n = graph.byId.get(nodeId)
    return n && owned && !n.autoGranted ? cascadeRemove(graph, state, n.name) : null
  }, [graph, state, nodeId, owned])
  if (!node) return null
  const tree = graph.treeById.get(node.treeId)
  const accent = accentOf(tree?.color ?? '#60a5fa')
  const occurrences = (graph.byName.get(node.name) ?? []).filter((o) => o.id !== node.id)
  const children = [...new Map(node.childIds.map((id) => graph.byId.get(id)).filter((n) => !!n).map((n) => [n!.name, n!])).values()]
  const stepIds = new Set(route?.steps.map((s) => s.nodeId) ?? [])
  // skills and levels already show on each step; keep the Ideals / DJ / ancestry conditions
  const extraGates = (route?.gates ?? []).filter((g): g is Extract<Gate, { kind: 'ideal' | 'story' | 'ancestry' | 'unknown' }> =>
    g.kind === 'ideal' || g.kind === 'story' || g.kind === 'ancestry' || g.kind === 'unknown')
  const choose = (key: string, name: string) => {
    const next = { ...choices, [key]: name }
    setChoices(next)
    onChoicesChange(next)
  }
  const openByName = (name: string) => {
    const occ = graph.byName.get(name)
    const pick = occ?.find((o) => o.treeId === node.treeId) ?? occ?.[0]
    if (pick) onOpenNode(pick.id)
  }

  // ── state line
  let stateLine: ReactNode
  let stateSub: string | null = null
  if (owned) stateLine = <><Check size={16} strokeWidth={3} aria-hidden /> {node.autoGranted ? 'Concedido: no se puede olvidar' : stateWords(mark, level)}</>
  else if (mark.kind === 'available') stateLine = <><Plus size={16} strokeWidth={3} aria-hidden /> {stateWords(mark, level)}</>
  else if (route?.reachable) {
    stateLine = <><Hourglass size={15} aria-hidden /> A {route.talents} {plural(route.talents, 'talento', 'talentos')} · lo antes posible en Nv {route.earliestLevel}</>
    const why: string[] = []
    if (route.earliestLevel > route.gateLevel) why.push(`1 talento por nivel (Nv ${level + 1} a ${route.earliestLevel})`)
    for (const s of route.skills) if (s.capLevel > level) why.push(`${s.skill} ${s.min} en Nv ${s.capLevel}`)
    stateSub = why.length ? why.join(' y ') : null
  } else stateLine = <><X size={16} aria-hidden /> Fuera de tus caminos: no hay ruta con tus caminos actuales</>

  // ── footer action
  let action: ReactNode = null
  if (owned && !node.autoGranted && cascade && !cascade.blocked) {
    const n = cascade.removed.length || 1
    action = (
      <Button variant="danger" size="lg" icon={<X size={16} aria-hidden />} onClick={() => onForget(node.id)} aria-haspopup="dialog" style={{ flex: 1 }}>
        {n > 1 ? `Olvidar ${n} talentos` : 'Olvidar talento'}
      </Button>
    )
  } else if (mark.kind === 'available') {
    action = <Button variant="primary" size="lg" icon={<Plus size={16} aria-hidden />} onClick={() => onLearn(node.id)} loading={busy} style={{ flex: 1 }}>Aprender</Button>
  } else if (!owned && route?.reachable) {
    action = isGoal
      ? <Button variant="secondary" size="lg" icon={<X size={16} aria-hidden />} onClick={onRemoveGoal} aria-haspopup="dialog" style={{ flex: 1 }}>Quitar objetivo</Button>
      : <Button variant="primary" size="lg" icon={<Target size={16} aria-hidden />} onClick={() => onSetGoal(node.id, choices)} style={{ flex: 1 }}>Fijar objetivo</Button>
  }

  const effect = (
    <p style={{ fontFamily: font.display, fontSize: fs.md + 1, color: c.text, lineHeight: 1.55, whiteSpace: 'pre-line' }}>{node.description}</p>
  )
  const stateBox = (
    <div style={{ padding: '10px 14px', borderRadius: radius.sm, background: owned || mark.kind === 'available' ? accent.wash(8, c.s2) : tone.topacio.bg, border: `1px solid ${owned || mark.kind === 'available' ? accent.border : tone.topacio.border}` }}>
      <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.sm + 1, fontWeight: 700, color: owned || mark.kind === 'available' ? accent.fg : c.text }}>{stateLine}</p>
      {stateSub && <p style={{ fontSize: fs.xs + 0.5, color: c.muted, marginTop: 3, lineHeight: 1.4 }}>{stateSub}</p>}
      {mark.kind === 'elsewhere' && <p style={{ fontSize: fs.xs + 0.5, color: c.muted, marginTop: 3 }}>Lo tienes por otra rama; aquí cuenta igual.</p>}
    </div>
  )

  return (
    <Sheet
      open
      onClose={onClose}
      maxWidth={560}
      title={<span style={{ fontFamily: font.display, color: owned ? accent.fg : c.text }}>{node.name}</span>}
      footer={
        <>
          <Button variant="secondary" size="lg" onClick={onClose} data-autofocus style={{ flex: action ? '0 0 auto' : 1 }}>Cerrar</Button>
          {action}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <TalentActivation type={node.activation} />
          <span style={{ ...pill({ fg: accent.fg, bg: accent.wash(10, 'transparent'), border: accent.border }), fontSize: fs.eyebrow, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {sourceOf(node, graph)}
          </span>
          {isGoal && <span style={{ ...pill(tone.brand), fontSize: fs.eyebrow, letterSpacing: '0.08em', textTransform: 'uppercase' }}><Target size={12} aria-hidden /> Objetivo</span>}
          {node.autoGranted && <span style={{ ...pill(tone.cuarzo), fontSize: fs.eyebrow, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Concedido</span>}
        </div>

        {owned ? <>{effect}{stateBox}</> : <>{stateBox}{effect}</>}

        {node.notaLibro && (
          <div style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: radius.sm, background: tone.zafiro.bg, border: `1px solid ${tone.zafiro.border}` }}>
            <BookOpen size={17} aria-hidden style={{ color: tone.zafiro.fg, flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ ...eyebrow, color: tone.zafiro.fg }}>Nota del libro</p>
              <p style={{ fontSize: fs.sm, color: c.text, lineHeight: 1.5, marginTop: 2 }}>{node.notaLibro}</p>
            </div>
          </div>
        )}

        <Block title="Requisitos">
          {ev && ev.gates.length > 0 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ev.gates.map((g, i) => {
                const sub = gateSub(g)
                const onRoute = g.kind === 'talent' && g.status !== 'met' && g.options.some((o) => o.nodeId && stepIds.has(o.nodeId))
                return (
                  <li key={g.clauseIndex} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <GateIcon g={g} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: fs.sm + 1, fontWeight: 650, color: c.text, lineHeight: 1.35 }}>
                        {i > 0 && <span style={{ color: c.subtle, fontWeight: 500 }}>y </span>}
                        {g.kind === 'talent'
                          ? g.options.map((o, k) => (
                            <span key={o.name}>
                              {k > 0 && <span style={{ color: c.subtle, fontWeight: 500 }}> o </span>}
                              <button type="button" className="ui-link" onClick={() => openByName(o.name)} style={linkBtn}>{o.name}</button>
                            </span>
                          ))
                          : gateMain(g)}
                        {g.implicit && <span style={{ color: c.subtle, fontWeight: 500 }}> (regla del libro)</span>}
                      </p>
                      {(sub || onRoute) && (
                        <p style={{ fontSize: fs.xs + 0.5, color: c.muted, lineHeight: 1.4, marginTop: 1 }}>
                          {[sub, onRoute ? 'está en la ruta' : null].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p style={{ fontSize: fs.sm, color: c.muted }}>Sin requisitos.</p>
          )}
        </Block>

        {!owned && route?.reachable && route.steps.length > 0 && (mark.kind !== 'available' || route.steps.length > 1) && (
          <Block title={`Cómo llegar · ${route.talents} ${plural(route.talents, 'talento', 'talentos')}`}>
            <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0, border: `1px solid ${c.border}`, borderRadius: radius.md, overflow: 'hidden' }}>
              {route.steps.map((s, i) => {
                const sn = graph.byId.get(s.nodeId)
                const isThis = s.nodeId === node.id
                const sub = s.availableNow ? 'Disponible ahora' : s.gates.length ? s.gates.map((g) => g.text).join(' · ') : s.minLevel > level ? `Nivel mínimo ${s.minLevel}` : 'Sin requisito extra'
                return (
                  <li key={s.nodeId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderTop: i ? `1px solid ${c.border}` : undefined, background: isThis ? c.s2 : c.s1 }}>
                    <span aria-hidden style={{ width: 24, height: 24, borderRadius: '50%', background: c.brand, color: c.onBrand, fontSize: fs.xs, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isThis && isGoal ? <Target size={14} strokeWidth={2.75} /> : i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: fs.sm + 1, fontWeight: 650, lineHeight: 1.3 }}>
                        <span className="sr-only">{isThis ? (isGoal ? 'Objetivo: ' : 'Este talento: ') : `Paso ${i + 1}: `}</span>
                        {isThis ? <span style={{ color: c.text }}>{s.name}</span> : <button type="button" className="ui-link" onClick={() => onOpenNode(s.nodeId)} style={linkBtn}>{s.name}</button>}
                      </p>
                      <p style={{ fontSize: fs.xs + 0.5, color: s.availableNow ? tone.esmeralda.fg : c.muted, lineHeight: 1.35, marginTop: 1, fontWeight: s.availableNow ? 650 : 500 }}>
                        {sub}{sn && sn.treeId !== node.treeId ? ` · ${sourceOf(sn, graph)}` : ''}
                      </p>
                    </div>
                    {i === 0 && s.availableNow && !isThis && (
                      <Button variant="primary" size="sm" icon={<Plus size={14} aria-hidden />} onClick={() => onLearn(s.nodeId)} loading={busy} aria-label={`Aprender ${s.name}`} style={{ flexShrink: 0 }}>
                        Aprender
                      </Button>
                    )}
                  </li>
                )
              })}
            </ol>
            {route.alternatives.map((alt) => (
              <div key={alt.key} style={{ marginTop: 12 }}>
                <p style={{ fontSize: fs.xs + 0.5, color: c.muted, marginBottom: 6 }}>
                  Rama «o» para <strong style={{ color: c.text }}>{graph.byId.get(alt.nodeId)?.name}</strong>: basta una.
                </p>
                <Segmented<string>
                  ariaLabel={`Rama para ${graph.byId.get(alt.nodeId)?.name ?? 'el talento'}`}
                  size="sm"
                  value={alt.chosen}
                  onChange={(v) => choose(alt.key, v)}
                  options={alt.options.map((o) => ({
                    value: o.name,
                    disabled: o.talents === null && !o.learned,
                    label: (
                      <span style={{ whiteSpace: 'normal', lineHeight: 1.2, padding: '4px 0', textAlign: 'center' }}>
                        {o.name}{o.learned ? ' ✓' : o.talents !== null ? ` · ${o.talents}` : ' · sin ruta'}
                      </span>
                    ),
                    ariaLabel: `${o.name}${o.learned ? ', ya lo tienes' : o.talents !== null ? `, ${o.talents} ${plural(o.talents, 'talento', 'talentos')}` : ', sin ruta'}`,
                  }))}
                />
              </div>
            ))}
            {extraGates.length > 0 && (
              <p style={{ fontSize: fs.xs + 0.5, color: c.muted, marginTop: 10, lineHeight: 1.45 }}>
                <strong style={{ color: c.text }}>Además:</strong> {extraGates.map((g) => (g.kind === 'story' ? `DJ: ${g.condition}` : g.text)).join(' · ')}
              </p>
            )}
            <p style={{ fontSize: fs.xs, color: c.subtle, marginTop: 8 }}>Orientativo: la ruta nunca bloquea nada.</p>
          </Block>
        )}

        {children.length > 0 && (
          <Block title="Desbloquea">
            <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {children.map((ch) => {
                const m = cellMark(evaluation.nodes.get(ch.id), level, ch.autoGranted)
                return (
                  <li key={ch.id}>
                    <button type="button" onClick={() => onOpenNode(ch.id)} className="ui-btn ui-btn--secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 36, padding: '0 12px', borderRadius: radius.full, border: `1px solid ${c.borderBright}`, background: c.s2, color: c.text, fontSize: fs.sm, fontWeight: 600, cursor: 'pointer' }}>
                      {ch.name}
                      <span style={{ fontSize: fs.xs, color: c.muted, fontWeight: 500 }}>· {stateWords(m, level)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Block>
        )}

        {occurrences.length > 0 && (
          <Block title="También aparece en">
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {occurrences.map((o) => {
                const m = cellMark(evaluation.nodes.get(o.id), level, o.autoGranted)
                return (
                  <li key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.sm }}>
                    {m.kind === 'learned' ? <Check size={14} strokeWidth={3} aria-hidden style={{ color: accent.fg }} /> : m.kind === 'elsewhere' ? <span style={{ color: accent.fg, display: 'inline-flex' }}><DottedCheck size={14} /></span> : null}
                    <button type="button" className="ui-link" onClick={() => onOpenNode(o.id)} style={linkBtn}>{sourceOf(o, graph)}</button>
                    <span style={{ color: c.muted }}>· {stateWords(m, level)}</span>
                  </li>
                )
              })}
            </ul>
            <p style={{ fontSize: fs.xs, color: c.subtle, marginTop: 6 }}>Es el mismo talento: si lo tienes, cuenta en todas sus ramas.</p>
          </Block>
        )}

        {(node.mejoradoPor.length > 0 || node.mejora.length > 0) && (
          <Block title="Relacionados">
            {node.mejoradoPor.length > 0 && (
              <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>
                <strong style={{ color: c.text }}>Mejorado por:</strong>{' '}
                {node.mejoradoPor.map((n, i) => <span key={n}>{i > 0 && ', '}<button type="button" className="ui-link" onClick={() => openByName(n)} style={linkBtn}>{n}</button></span>)}
              </p>
            )}
            {node.mejora.length > 0 && (
              <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5, marginTop: 4 }}>
                <strong style={{ color: c.text }}>Modifica a:</strong>{' '}
                {node.mejora.map((n, i) => <span key={n}>{i > 0 && ', '}<button type="button" className="ui-link" onClick={() => openByName(n)} style={linkBtn}>{n}</button></span>)}
              </p>
            )}
          </Block>
        )}

        {node.formas.length > 0 && (
          <Block title={`Formas ${owned ? 'desbloqueadas' : 'que obtendrás'}`}>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {node.formas.map((forma) => {
                const isActive = evaluation.formaActiva === forma.nombre
                return (
                  <FormaCard
                    key={forma.nombre}
                    forma={forma}
                    isActive={isActive}
                    accent={accent}
                    showPoderNote
                    showAcciones
                    onActivate={owned && !isActive ? () => onActivateForma(forma.nombre) : undefined}
                  />
                )
              })}
            </ul>
          </Block>
        )}

        {cascade && (cascade.alsoRemoved.length > 0 || cascade.formaInvalidada) && (
          <div style={{ padding: '12px 16px', borderRadius: radius.sm, background: tone.rubi.bg, border: `1px solid ${tone.rubi.border}` }}>
            <p style={{ ...eyebrow, color: tone.rubi.fg }}>Si lo olvidas, también se olvidarán</p>
            <ul style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {cascade.alsoRemoved.map((n) => (
                <li key={n} style={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: fs.sm, color: c.text, lineHeight: 1.35 }}>
                  <span aria-hidden style={{ width: 5, height: 5, borderRadius: '50%', background: tone.rubi.fg, flexShrink: 0 }} />
                  {n}
                </li>
              ))}
            </ul>
            {cascade.formaInvalidada && (
              <p style={{ fontSize: fs.sm, color: c.text, marginTop: 6 }}>Y se desactivará la forma activa «{cascade.formaInvalidada}».</p>
            )}
          </div>
        )}
      </div>
    </Sheet>
  )
}
