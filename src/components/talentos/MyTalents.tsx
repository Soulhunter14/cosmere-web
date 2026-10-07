/**
 * MyTalents — "Mis talentos" (RELEER): everything the player already has, grouped by cost in the
 * book legend order, flat (no tree geometry), for a quick reread at the table.
 *
 * Consumes a `TalentGraph`/`TalentEvaluation` already built by the page (lib/talentGraph.ts) —
 * this component owns no rules logic. A talent whose name is shared by several occurrences
 * (Robusto in four heroic paths, "Segundo Ideal" reused per order…) is shown once with every
 * source listed. The card summaries are the ones of the world of the graph (`graph.rules.summaries`). Mistborn adds, for the powers of the
 * character, the basic actions of each complete power (or its nascent version) and «Beber vial (1)», which opens the sheet of the vial (§7.7 #4).
 */
import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, Music, Sparkle, TriangleAlert, Zap } from 'lucide-react'
import type { Character } from '../../types'
import { TalentActivation, type ActivationType } from '../TalentActivation'
import { CosmereIcon } from '../CosmereIcon'
import { RadiantOrderIcon } from '../RadiantOrderIcon'
import { Button, EmptyState, Segmented } from '../ui'
import { c, eyebrow, font, fs, radius, shadow, tone, toneFrom, type Tone } from '../../theme'
import { RADIANT_ORDERS, RADIANT_REGLAS } from '../../data/radiantOrders'
import { POTENCIAS } from '../../data/potencias'
import { CANTOR_COLOR, getFormasDisponibles } from '../../data/cantores'
import type { FormaCantor } from '../../data/cantores'
import type { AccionPoder } from '../../data/mistborn/tipos'
import type { TalentGraph, TalentEvaluation, TalentNode, TalentTree, TreeKind } from '../../lib/talentGraph'
import type { PoderDef } from '../../worlds/types'
import { sourceOf } from './talentMap'

/* ─── localStorage prefs (try/catch: private windows, blocked storage…) ─── */
function readPref<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback
  } catch {
    return fallback
  }
}
function writePref(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* ignore: private window / blocked storage */ }
}

const AGRUPAR_KEY = 'cosmere-talentos-agrupar'
const TEXTO_KEY = 'cosmere-talentos-texto'
type Agrupar = 'accion' | 'arbol'
type Texto = 'resumen' | 'completo'

/* ─── Cost groups, book legend order ─── */
type CostGroup = 'acciones' | 'reacciones' | 'gratuitas' | 'especial' | 'siempre'
const GROUP_ORDER: CostGroup[] = ['acciones', 'reacciones', 'gratuitas', 'especial', 'siempre']
const GROUP_LABEL: Record<CostGroup, string> = {
  acciones: 'Acciones', reacciones: 'Reacciones', gratuitas: 'Acciones gratuitas',
  especial: 'Activación especial', siempre: 'Siempre activo',
}
const GROUP_ICON: Record<CostGroup, string> = {
  acciones: 'accion-1', reacciones: 'reaccion', gratuitas: 'accion-gratuita',
  especial: 'activacion-especial', siempre: 'siempre-activo',
}
const ACTION_RANK: Record<ActivationType, number> = { action1: 1, action2: 2, action3: 3, reaction: 0, free: 0, special: 0, passive: 0 }
function groupOf(a: ActivationType): CostGroup {
  if (a === 'action1' || a === 'action2' || a === 'action3') return 'acciones'
  if (a === 'reaction') return 'reacciones'
  if (a === 'free') return 'gratuitas'
  if (a === 'special') return 'especial'
  return 'siempre'
}

/** First sentence of a description, used when the book has no short summary for a talent. */
function firstSentence(text: string): string {
  const m = text.match(/^[^.!?]*[.!?]/)
  return (m ? m[0] : text).trim()
}

interface Entry {
  key: string
  name: string
  activation: ActivationType
  /** e.g. "Cazador · Arquero" — every occurrence of this name, deduplicated */
  sources: string[]
  description: string
  mejoradoPor?: string[]
  formas?: FormaCantor[]
  /** null for virtual rows (radiant actions, surge base power): no tree node backs them */
  primaryNodeId: string | null
  treeGroupKey: string
  treeGroupLabel: string
  treeGroupOrder: number
  /** a button under the full text (the vial: «Beber vial…»), which the component wires to the page */
  accion?: { label: string }
}

const RADIANT_ACTIONS: { name: string; activation: ActivationType }[] = [
  { name: 'Absorber luz tormentosa', activation: 'action2' },
  { name: 'Aumentar', activation: 'action1' },
  { name: 'Revitalizar', activation: 'free' },
]

/**
 * The trees that name themselves (the Investida path with a flat tree, an ancestry, a power of Mistborn: their `pathName` is their `section`) are written
 * once, never «Brumoso · Brumoso» (T36); the singer tree of Stormlight keeps its «Cantor · Cantor» (P1)
 */
const ARBOLES_CON_NOMBRE_PROPIO: ReadonlySet<TreeKind> = new Set<TreeKind>(['caminoInvestido', 'ascendencia', 'poder'])

/** The tree of a group of «Por árbol»: «Cazador · Arquero», «Brumoso», «Brumoso · Alomancia de acero» */
const grupoDeArbol = (tree: TalentTree): string =>
  ARBOLES_CON_NOMBRE_PROPIO.has(tree.kind) && tree.pathName === tree.section ? tree.section : `${tree.pathName} · ${tree.section}`

/** The cost in actions that the sheets of the book put next to the actions of a power: «Quemar acero (1)», «Beber vial (1)» */
const COSTE_EN_ACCIONES: Partial<Record<ActivationType, string>> = { action1: ' (1)', action2: ' (2)', action3: ' (3)' }
const conCoste = (nombre: string, activacion: ActivationType): string => `${nombre}${COSTE_EN_ACCIONES[activacion] ?? ''}`

/** What the vial does (L.129-130 / PDF 135-136), the same rule as the sheet of the vial */
const BEBER_VIAL =
  'Bebes un vial con los metales que elijas. Si contiene un metal que puedes quemar, recuperas Investidura hasta tu valor máximo; ' +
  'los poderes cuyo metal está en el vial dejan de estar Desprovistos y los demás quedan Desprovistos.'

/** The full text of an action of a power: what it does, its options and effects, its cost and its duration */
function describirAccion(a: AccionPoder): string {
  const bloques = [a.descripcion]
  if (a.opciones?.length) bloques.push(a.opciones.map((o) => `${o.nombre}: ${o.descripcion}`).join('\n'))
  if (a.efectos?.length) bloques.push(a.efectos.map((e) => `• ${e}`).join('\n'))
  bloques.push(`Coste: ${a.coste} · Duración: ${a.duracion}${a.mantener ? `\nMantener: ${a.mantener}` : ''}`)
  return bloques.join('\n\n')
}

function surgeRank(character: Character, surgeName: string): number {
  const fields = character as unknown as Record<string, unknown>
  for (let i = 1; i <= 6; i++) {
    if (fields[`habilidadPersonalizada${i}`] === surgeName)
      return Number(fields[`habilidadPersonalizada${i}Valor`] ?? 0) || 0
  }
  return 0
}

function buildEntries(character: Character, graph: TalentGraph, evaluation: TalentEvaluation, conVial: boolean): Entry[] {
  const list: Entry[] = []
  const pathNameOf = (n: TalentNode) => graph.treeById.get(n.treeId)?.pathName ?? n.pathId
  const orderOf = (treeId: string) => graph.treeById.get(treeId)?.order ?? 999
  /** Where a talent comes from: «Cazador · Arquero»; the trees that name themselves say it as the map does («Brumoso · talento principal», «Kandra») */
  const fuenteDe = (n: TalentNode) => (ARBOLES_CON_NOMBRE_PROPIO.has(n.kind) ? sourceOf(n, graph) : `${pathNameOf(n)} · ${n.section}`)
  const grupoDe = (n: TalentNode) => { const tree = graph.treeById.get(n.treeId); return tree ? grupoDeArbol(tree) : `${pathNameOf(n)} · ${n.section}` }

  for (const name of evaluation.learned) {
    const nodes = graph.byName.get(name)
    if (!nodes || nodes.length === 0) continue // leftover in `talentos` that is not a talent (surge/path/specialty name)
    const primary: TalentNode =
      nodes.find((n) => evaluation.nodes.get(n.id)?.state === 'learned')
      ?? nodes.find((n) => evaluation.nodes.get(n.id)?.state === 'learnedElsewhere')
      ?? nodes[0]
    const sources = [...new Set(nodes.map(fuenteDe))]
    list.push({
      key: name,
      name,
      activation: primary.activation,
      sources,
      description: primary.description,
      mejoradoPor: primary.mejoradoPor.length ? primary.mejoradoPor : undefined,
      formas: primary.formas.length ? primary.formas : undefined,
      primaryNodeId: primary.id,
      treeGroupKey: primary.treeId,
      treeGroupLabel: grupoDe(primary),
      treeGroupOrder: orderOf(primary.treeId),
    })
  }

  const order = RADIANT_ORDERS.find((o) => o.id === graph.radiantOrderId)
  if (order && evaluation.learned.has('Primer Ideal')) {
    const bondTreeId = `radiante:${order.id}`
    const accionesDetails = RADIANT_REGLAS.find((r) => r.id === 'acciones-luz')?.details ?? []
    const treeGroupOrder = orderOf(bondTreeId)
    for (const ra of RADIANT_ACTIONS) {
      const detail = accionesDetails.find((d) => d.label.startsWith(ra.name))
      list.push({
        key: `radiante-accion:${ra.name}`,
        name: ra.name,
        activation: ra.activation,
        sources: [`${order.name} · Primer Ideal`],
        description: detail?.text ?? '',
        primaryNodeId: null,
        treeGroupKey: `radiante:${order.id}`,
        treeGroupLabel: `${order.name} · Primer Ideal`,
        treeGroupOrder,
      })
    }
    for (const surge of order.surges) {
      const pot = POTENCIAS.find((p) => p.name === surge)
      if (!pot) continue
      const rank = surgeRank(character, surge)
      list.push({
        key: `potencia-base:${surge}`,
        name: `${surge} (poder base)`,
        activation: pot.costoBase,
        sources: [`${order.name} · ${surge}`],
        description: `${pot.descripcion} Rango ${rank || 1} en ${pot.atributo}.`,
        primaryNodeId: null,
        treeGroupKey: `potencia:${pot.id}`,
        treeGroupLabel: `${order.name} · ${surge}`,
        treeGroupOrder: orderOf(`potencia:${pot.id}`),
      })
    }
  }

  // The powers of the character (Mistborn; Stormlight characters have none): the basic actions of each COMPLETE power. Before its goal is done a power is
  // only nascent: no rules of its own, just small narrative effects that the DJ and the player agree on (L.162 / PDF 168), so it is one row, not its actions
  const metaNombre = (graph.rules.nombreMeta ?? 'Meta').toLowerCase()
  character.poderes.forEach((poder, i) => {
    const def = graph.rules.poderes.find((d): d is PoderDef => 'caminos' in d && d.arte === poder.arte && d.metal === poder.metal)
    if (!def) return
    const treeId = `poder:${def.arte}:${def.metal}`
    const tree = graph.treeById.get(treeId)
    const grupo = { treeGroupKey: treeId, treeGroupLabel: tree ? grupoDeArbol(tree) : def.name, treeGroupOrder: tree?.order ?? 900 + i }
    // alomancia de atium has no nascent version and no goal (L.177 / PDF 183): it is always the complete one
    if (poder.completo || !def.requiereMeta) {
      for (const a of def.acciones) {
        list.push({
          key: `poder-accion:${treeId}:${a.nombre}`, name: conCoste(a.nombre, a.activacion), activation: a.activacion, sources: [def.name],
          description: describirAccion(a), primaryNodeId: null, ...grupo,
        })
      }
      return
    }
    const usos = def.usosCreativos.length ? `\n\nPara inspirarte, sus usos creativos: ${def.usosCreativos.map((u) => u.nombre).join(', ')}.` : ''
    list.push({
      key: `poder-naciente:${treeId}`, name: `${def.name} (naciente)`, activation: 'special', sources: [def.name],
      description: `Aún no has completado tu ${metaNombre} para este poder: solo tienes su versión naciente, con pequeños efectos narrativos que acuerdas con la DJ. `
        + `Al completarla desbloqueas sus acciones (${def.acciones.map((a) => a.nombre).join(', ')}).${usos}`,
      primaryNodeId: null, ...grupo,
    })
  })

  // «Beber vial (1)»: the action the alomantic paths give with their Investiture (L.129 / PDF 135); it sits with the Investida path in «Por árbol»
  if (conVial) {
    const camino = graph.trees.find((t) => t.kind === 'caminoInvestido')
    list.push({
      key: 'beber-vial', name: conCoste('Beber vial', 'action1'), activation: 'action1', sources: ['Alomancia'], description: BEBER_VIAL,
      primaryNodeId: null, accion: { label: 'Beber vial…' },
      treeGroupKey: camino?.id ?? 'beber-vial', treeGroupLabel: camino ? grupoDeArbol(camino) : 'Alomancia', treeGroupOrder: camino?.order ?? 899,
    })
  }

  return list
}

/* ─── Row ─── */
function EntryRow({
  entry, summaries, forced, expanded, onToggle, onOpenTalent, onShowInTree, onAccion,
}: {
  entry: Entry
  /** card text of the world of the graph (`graph.rules.summaries`) */
  summaries: Readonly<Record<string, string>>
  /** Segmented "Completo": every row shows its full text regardless of individual state */
  forced: boolean
  expanded: boolean
  onToggle: () => void
  onOpenTalent: (nodeId: string) => void
  onShowInTree: (nodeId: string) => void
  /** what the button of the row (`entry.accion`) does */
  onAccion?: () => void
}) {
  const isOpen = forced || expanded
  const summary = summaries[entry.name] ?? firstSentence(entry.description)
  return (
    <li style={{ borderTop: `1px solid ${c.border}` }}>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="ui-row"
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%',
          padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', color: c.text,
        }}
      >
        <span style={{ marginTop: 2, flexShrink: 0 }}>
          <TalentActivation type={entry.activation} compact />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: font.display, fontSize: fs.base + 2, fontWeight: 600, lineHeight: 1.3, color: c.text }}>
            {entry.name}
          </span>
          <span style={{ ...eyebrow, display: 'block', marginTop: 3, color: c.subtle, fontWeight: 650 }}>
            {entry.sources.join(' · ')}
          </span>
          {!isOpen && summary && (
            <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: fs.sm, color: c.muted, marginTop: 4, lineHeight: 1.4 }}>
              {summary}
            </span>
          )}
        </span>
        <ChevronDown
          size={18} aria-hidden
          style={{ flexShrink: 0, marginTop: 3, color: c.subtle, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-2) var(--ease-out)' }}
        />
      </button>
      {isOpen && (
        <div className="fade-in" style={{ padding: '0 14px 14px 46px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: fs.sm + 1, color: c.text, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{entry.description}</p>
          {entry.mejoradoPor && (
            <p style={{ fontSize: fs.xs, color: c.subtle, lineHeight: 1.45 }}>
              <strong style={{ color: c.muted, fontWeight: 650 }}>Mejorado por:</strong> {entry.mejoradoPor.join(', ')}
            </p>
          )}
          {entry.formas && entry.formas.length > 0 && (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {entry.formas.map((f) => (
                <li key={f.nombre} style={{ fontSize: fs.xs, color: c.muted, lineHeight: 1.4 }}>
                  <strong style={{ color: c.text, fontWeight: 650 }}>{f.nombre}</strong> — {f.bonos}
                </li>
              ))}
            </ul>
          )}
          {entry.accion && onAccion && (
            <div>
              <Button variant="secondary" size="md" aria-haspopup="dialog" onClick={onAccion}>{entry.accion.label}</Button>
            </div>
          )}
          {entry.primaryNodeId && (
            <p style={{ display: 'flex', gap: 16 }}>
              <button type="button" className="ui-link" onClick={() => onShowInTree(entry.primaryNodeId!)} style={{ background: 'none', border: 'none', padding: 0, color: c.brand, fontSize: fs.sm, fontWeight: 650, cursor: 'pointer' }}>
                Ver en el árbol
              </button>
              <button type="button" className="ui-link" onClick={() => onOpenTalent(entry.primaryNodeId!)} style={{ background: 'none', border: 'none', padding: 0, color: c.brand, fontSize: fs.sm, fontWeight: 650, cursor: 'pointer' }}>
                Opciones
              </button>
            </p>
          )}
        </div>
      )}
    </li>
  )
}

function GroupTitle({ icon, label, count }: { icon?: ReactNode; label: string; count: number }) {
  return (
    <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, ...eyebrow, color: c.subtle, margin: '20px 0 4px' }}>
      {icon}
      {label}
      <span style={{ ...eyebrow, color: c.text }}>{count}</span>
    </h2>
  )
}

/* ─── Cantor active-form card ─── */
function FormaActivaCard({ evaluation, onChangeForma }: { evaluation: TalentEvaluation; onChangeForma?: () => void }) {
  const disponibles = getFormasDisponibles([...evaluation.learned])
  const data = evaluation.formaActiva ? disponibles.find((f) => f.nombre === evaluation.formaActiva) ?? null : null
  const t: Tone = toneFrom(CANTOR_COLOR)
  return (
    <section style={{ background: c.s1, border: `1px solid ${t.border}`, borderRadius: radius.lg, boxShadow: shadow[1], padding: '14px 16px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, ...eyebrow, color: t.fg }}>
          <Music size={14} aria-hidden />
          Forma activa
        </h2>
        {onChangeForma && (
          <Button variant="secondary" size="sm" onClick={onChangeForma}>Cambiar</Button>
        )}
      </div>
      {data ? (
        <>
          <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: font.display, fontSize: fs.lg, fontWeight: 650, color: c.text, marginTop: 8 }}>
            {data.esPoder && <Zap size={16} aria-hidden style={{ color: tone.rubi.fg }} />}
            {data.nombre}
          </p>
          <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 4, lineHeight: 1.45 }}>{data.bonos}</p>
          {!evaluation.formaActivaValida && (
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.xs, color: tone.topacio.fg, marginTop: 6 }}>
              <TriangleAlert size={13} aria-hidden />
              Ya no desbloqueada por tus talentos actuales
            </p>
          )}
        </>
      ) : (
        <>
          <p style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 650, color: c.subtle, marginTop: 8 }}>Sin forma activa</p>
          <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 4, lineHeight: 1.45 }}>
            Aprende un talento de <strong style={{ color: c.text }}>Formas</strong> para elegir tu forma (cambia en alta tormenta).
          </p>
        </>
      )}
    </section>
  )
}

/* ─── Hint: Primer Ideal missing ─── */
function IdealHintCard({ graph, onShowInTree }: { graph: TalentGraph; onShowInTree: (nodeId: string) => void }) {
  const order = RADIANT_ORDERS.find((o) => o.id === graph.radiantOrderId)
  if (!order) return null
  const bondTree = graph.treeById.get(`radiante:${order.id}`)
  const keyNodeId = bondTree?.keyNodeId ?? null
  const t = toneFrom(order.color)
  return (
    <section style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: radius.lg, padding: '14px 16px', marginTop: 20 }}>
      <p style={{ display: 'flex', alignItems: 'center', gap: 8, ...eyebrow, color: t.fg }}>
        <RadiantOrderIcon orderId={order.id} size={16} decorative />
        {order.name}
      </p>
      <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 6, lineHeight: 1.5 }}>
        Aún no tienes el <strong style={{ color: c.text }}>Primer Ideal</strong> (nivel 2+). Cuando lo aprendas aparecerán
        aquí Absorber luz tormentosa, Aumentar y Revitalizar; al jurarlo, el poder base de {order.surges.join(' y ')} con su rango.
      </p>
      {keyNodeId && (
        <button type="button" onClick={() => onShowInTree(keyNodeId)} style={{ background: 'none', border: 'none', padding: 0, marginTop: 8, color: t.fg, fontSize: fs.sm, fontWeight: 650, cursor: 'pointer' }}>
          Planificarlo en el árbol
        </button>
      )}
    </section>
  )
}

/* ─── Component ─── */
export function MyTalents({ character, graph, evaluation, onOpenTalent, onShowInTree, onChangeForma, onBeberVial }: {
  character: Character
  graph: TalentGraph
  evaluation: TalentEvaluation
  onOpenTalent: (nodeId: string) => void
  onShowInTree: (nodeId: string) => void
  onChangeForma?: () => void
  /** Opens the sheet of the vial (Mistborn). Only given when the character has a power a vial acts upon and may drink one: without it there is no «Beber vial (1)» */
  onBeberVial?: () => void
}) {
  const [agrupar, setAgrupar] = useState<Agrupar>(() => readPref(AGRUPAR_KEY, ['accion', 'arbol'] as const, 'accion'))
  const [texto, setTexto] = useState<Texto>(() => readPref(TEXTO_KEY, ['resumen', 'completo'] as const, 'resumen'))
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())

  const conVial = !!onBeberVial
  const entries = useMemo(() => buildEntries(character, graph, evaluation, conVial), [character, graph, evaluation, conVial])
  const order = RADIANT_ORDERS.find((o) => o.id === graph.radiantOrderId)
  const showIdealHint = !!order && !evaluation.learned.has('Primer Ideal')

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })

  const groups: { key: string; icon?: ReactNode; label: string; items: Entry[] }[] = useMemo(() => {
    if (agrupar === 'accion') {
      const buckets = new Map<CostGroup, Entry[]>()
      for (const e of entries) {
        const g = groupOf(e.activation)
        if (!buckets.has(g)) buckets.set(g, [])
        buckets.get(g)!.push(e)
      }
      for (const arr of buckets.values())
        arr.sort((a, b) => ACTION_RANK[a.activation] - ACTION_RANK[b.activation] || a.name.localeCompare(b.name, 'es'))
      return GROUP_ORDER.filter((g) => buckets.get(g)?.length)
        .map((g) => ({ key: g, icon: <CosmereIcon name={GROUP_ICON[g]} size={12} />, label: GROUP_LABEL[g], items: buckets.get(g)! }))
    }
    const buckets = new Map<string, Entry[]>()
    for (const e of entries) {
      if (!buckets.has(e.treeGroupKey)) buckets.set(e.treeGroupKey, [])
      buckets.get(e.treeGroupKey)!.push(e)
    }
    return [...buckets.entries()]
      .sort((a, b) => a[1][0].treeGroupOrder - b[1][0].treeGroupOrder)
      .map(([key, items]) => ({ key, label: items[0].treeGroupLabel, items }))
  }, [entries, agrupar])

  const nothingLearned = entries.length === 0 && !graph.isCantor && !showIdealHint

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <Segmented<Agrupar>
          ariaLabel="Agrupar"
          size="sm"
          stretch={false}
          value={agrupar}
          onChange={(v) => { setAgrupar(v); writePref(AGRUPAR_KEY, v) }}
          options={[{ value: 'accion', label: 'Por acción' }, { value: 'arbol', label: 'Por árbol' }]}
        />
        <Segmented<Texto>
          ariaLabel="Texto"
          size="sm"
          stretch={false}
          value={texto}
          onChange={(v) => { setTexto(v); writePref(TEXTO_KEY, v) }}
          options={[{ value: 'resumen', label: 'Resumen' }, { value: 'completo', label: 'Completo' }]}
        />
      </div>

      {graph.isCantor && <FormaActivaCard evaluation={evaluation} onChangeForma={onChangeForma} />}

      {nothingLearned ? (
        <EmptyState
          icon={<Sparkle size={22} aria-hidden />}
          title="Sin talentos aprendidos"
          description="Los talentos que aprendas aparecerán aquí, agrupados para releerlos rápido en la mesa."
        />
      ) : (
        groups.map((g) => (
          <section key={g.key}>
            <GroupTitle icon={g.icon} label={g.label} count={g.items.length} />
            <ul style={{ listStyle: 'none' }}>
              {g.items.map((e) => (
                <EntryRow
                  key={e.key}
                  entry={e}
                  summaries={graph.rules.summaries}
                  forced={texto === 'completo'}
                  expanded={expanded.has(e.key)}
                  onToggle={() => toggle(e.key)}
                  onOpenTalent={onOpenTalent}
                  onShowInTree={onShowInTree}
                  onAccion={onBeberVial}
                />
              ))}
            </ul>
          </section>
        ))
      )}

      {showIdealHint && <IdealHintCard graph={graph} onShowInTree={onShowInTree} />}
    </div>
  )
}
