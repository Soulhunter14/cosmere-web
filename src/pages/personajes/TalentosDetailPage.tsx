/**
 * Talentos de un personaje (routes personajes/talentos/:characterId and gm/talentos/:characterId).
 *
 * One page, two modes in a sticky bar: ÁRBOL (plan with a global view of every tree: heroic path(s),
 * radiant order, singer, the metalborn path with its powers, ancestry trees, plus the other heroic paths to explore) and MIS TALENTOS (reread
 * what you have, and drink a vial from there in Nacidos de la bruma).
 * Rules live in lib/talentGraph.ts and run on the TalentRules of the world of the campaign (useWorldData().talentos); the map
 * geometry in components/talentos/talentMap.ts.
 * Stored format is unchanged: Character.talentos = JSON array of names (+ the ~forma~ marker).
 * The planning goal, open láminas, the mode and the DJ confirmations are local (localStorage).
 */
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Compass, Info, Music, RefreshCw, Sparkles, Target, TriangleAlert, X } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { Button, ConfirmDialog, Disclosure, EmptyState, ErrorMessage, IconButton, Segmented, Sheet, Spinner, Stepper } from '../../components/ui'
import type { Character, UpdateCharacterRequest } from '../../types'
import { CANTOR_COLOR, getFormasDisponibles, withFormaActiva } from '../../data/cantores'
import { CharacterHero } from '../../components/CharacterHero'
import { CharacterIdentityPills } from '../../components/CharacterIdentityPills'
import { HeroicPathIcon } from '../../components/GameIcons'
import { conVialBebido, esPoderDelVial } from '../../components/mistborn/vial'
import { TalentActivation, type ActivationType } from '../../components/TalentActivation'
import { heroPill, onGem, onGemSoft } from '../../lib/hero'
import { useAuthStore } from '../../store/authStore'
import { useCampaignStore, useWorldConfig, useWorldData } from '../../store/campaignStore'
import { c, eyebrow, font, fs, radius, titleText, tone } from '../../theme'
import {
  buildTalentGraph, cascadeRemove, cheapestRoute, evaluate, graphOptionsFromCharacter, parseStoredTalentos,
  splitStoredTalentos, talentBudget, talentStateFromCharacter, withTalent,
  type CascadeResult, type Gate, type TalentEvaluation, type TalentGraph,
} from '../../lib/talentGraph'
import type { TalentRules } from '../../lib/talentRules'
import { PathAtlas } from '../../components/talentos/PathAtlas'
import { TalentSheet } from '../../components/talentos/TalentSheet'
import { FormaPickerSheet } from '../../components/talentos/FormaPicker'
import { MyTalents } from '../../components/talentos/MyTalents'
import { BudgetSheet } from '../../components/talentos/BudgetSheet'
import { CellMarkView, IdealGlyph } from '../../components/talentos/MapPieces'
import { WIDE_MIN, buildPathModels, cellDomId, plural, type EdgeStatusFn, type PathModel } from '../../components/talentos/talentMap'
import { META_LOCKED, accentOf, readStore, useContentWidth, usePrefersReducedMotion, writeStore } from '../../components/talentos/talentStyle'

// «Beber vial» (T31): the sheet of the vial of Nacidos de la bruma, loaded lazily from the barrel so that neither it nor its data reach the main chunk (§7.4 rule 4)
const BeberVialSheet = lazy(() => import('../../components/mistborn').then((m) => ({ default: m.BeberVialSheet })))

type Mode = 'arbol' | 'releer'
interface Goal { nodeId: string; choices: Record<string, string> }

const isMode = (v: unknown): v is Mode => v === 'arbol' || v === 'releer'
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string')
const isGoal = (v: unknown): v is Goal =>
  !!v && typeof v === 'object' && typeof (v as Goal).nodeId === 'string' &&
  !!(v as Goal).choices && typeof (v as Goal).choices === 'object'

/** 0 below 640px, `px` from 640px (inline styles cannot use media queries) */
const fromTablet = (px: number) => `clamp(0px, calc((100vw - 640px) * 999), ${px}px)`

export function TalentosDetailPage() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const cId = Number(campaignId)
  const charId = Number(characterId)
  const { data: character, isLoading, isError } = useQuery<Character>({
    queryKey: ['character', cId, charId],
    queryFn: () => charactersApi.getById(cId, charId),
  })
  // The talent data of the world of the campaign (heroic paths, Investida paths, powers, grids…). Stormlight's are `initialData` of
  // useWorldData, so there it never waits (no new Spinner); Mistborn's come with the lazy chunk of its world
  const { data: worldData, isPending: worldPending } = useWorldData()
  const rules = worldData?.talentos ?? null
  // Loading keeps a (visually hidden) h1 so the page is never headless, as in CharacterDetailPage
  if (isLoading || !character || worldPending) {
    return (
      <>
        <h1 className="sr-only">Talentos</h1>
        {isError ? <div style={{ maxWidth: 680, margin: '0 auto', padding: 16 }}><ErrorMessage message="No se pudo cargar el personaje." /></div> : <Spinner />}
      </>
    )
  }
  // The chunk did not load: never build the map with the rules of another world. A failed `import()` stays failed for the rest of the
  // document (the browser keeps the failure), so a `refetch()` could not recover it: only reloading the page does
  if (!rules) {
    return (
      <>
        <h1 className="sr-only">Talentos</h1>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: 16 }}>
          <ErrorMessage message="No se pudieron cargar los talentos." style={{ marginBottom: 16 }} />
          <Button onClick={() => window.location.reload()} icon={<RefreshCw size={15} aria-hidden />}>
            Recargar la página
          </Button>
        </div>
      </>
    )
  }
  return <TalentosView key={charId} character={character} cId={cId} rules={rules} />
}

function TalentosView({ character, cId, rules }: { character: Character; cId: number; rules: TalentRules }) {
  const charId = character.id
  const qc = useQueryClient()
  const qKey = useMemo(() => ['character', cId, charId] as const, [cId, charId])
  const user = useAuthStore((s) => s.user)
  const isGm = useCampaignStore((s) => s.isGm)
  // Capabilities and texts of the world of the campaign: Ideales jurados and formas of cantor are Roshar features
  const cfg = useWorldConfig()
  const canEditIdeals = isGm || (!!user && character.ownerId === user.id)
  const [searchParams, setSearchParams] = useSearchParams()
  const contentW = useContentWidth()
  const reducedMotion = usePrefersReducedMotion()
  const wide = contentW >= WIDE_MIN

  // ── local, per-device preferences ────────────────────────────────────────
  const vistaKey = `cosmere-talentos-vista:${user?.id ?? 'anon'}`
  const goalKey = `cosmere-talentos-objetivo:${charId}`
  const lamKey = `cosmere-talentos-laminas:${charId}`
  const djKey = `cosmere-talentos-dj:${charId}`
  const [mode, setModeState] = useState<Mode>(() => {
    const q = searchParams.get('vista')
    return isMode(q) ? q : readStore<Mode>(vistaKey, 'arbol', isMode)
  })
  const [goal, setGoalState] = useState<Goal | null>(() => readStore<Goal | null>(goalKey, null, (v): v is Goal | null => v === null || isGoal(v)))
  const [openLaminas, setOpenLaminas] = useState<Set<string>>(() => new Set(readStore<string[]>(lamKey, [], isStringArray)))
  const [confirmedStory, setConfirmedStory] = useState<string[]>(() => readStore<string[]>(djKey, [], isStringArray))

  // ── UI state ─────────────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetId, setSheetId] = useState<string | null>(null)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [formaOpen, setFormaOpen] = useState(false)
  const [vialOpen, setVialOpen] = useState(false)
  const [showOthers, setShowOthers] = useState(false)
  const [djConfirm, setDjConfirm] = useState<{ name: string; conditions: string[]; keys: string[] } | null>(null)
  const [forgetConfirm, setForgetConfirm] = useState<(CascadeResult & { name: string }) | null>(null)
  const [goalConfirm, setGoalConfirm] = useState<{ kind: 'remove' } | { kind: 'replace'; goal: Goal } | null>(null)
  const [liveMsg, setLiveMsg] = useState('')
  const pendingScroll = useRef<string | null>(null)

  // ── engine ───────────────────────────────────────────────────────────────
  // The metalborn path, the starting path and the powers build trees too (§7.7 #3): changing them on the sheet rebuilds the graph
  const { caminoHeroico, caminoRadiante, ascendencia, caminoMetal, caminoInicial, poderes } = character
  const stored = useMemo(() => parseStoredTalentos(character.talentos), [character.talentos])
  const extraKey = useMemo(() => {
    const names = new Set(splitStoredTalentos(stored).names)
    return rules.caminosHeroicos.filter((p) => p.id !== caminoHeroico && names.has(p.mainTalent)).map((p) => p.id).join(',')
  }, [stored, caminoHeroico, rules])
  const extraPaths = useMemo(() => (extraKey ? extraKey.split(',') : []), [extraKey])
  const graph = useMemo(
    () => buildTalentGraph(graphOptionsFromCharacter({ caminoHeroico, caminoRadiante, ascendencia, caminoMetal, caminoInicial, poderes }, extraPaths, rules), rules),
    [caminoHeroico, caminoRadiante, ascendencia, caminoMetal, caminoInicial, poderes, extraPaths, rules],
  )
  const tState = useMemo(() => talentStateFromCharacter(character, { confirmedStory }, graph.rules), [character, confirmedStory, graph.rules])
  const evaluation = useMemo(() => evaluate(graph, tState), [graph, tState])
  const budget = useMemo(() => talentBudget(character, graph), [character, graph])
  const models = useMemo(() => buildPathModels(graph), [graph])

  // other heroic paths (explore): built only when needed
  const otherPathIds = useMemo(
    () => rules.caminosHeroicos.map((p) => p.id).filter((id) => id !== caminoHeroico && !extraPaths.includes(id)),
    [rules, caminoHeroico, extraPaths],
  )
  const needExplore = showOthers || [goal?.nodeId, sheetId, selectedId].some((id) => !!id && !graph.byId.has(id))
  const exploreGraph = useMemo(
    () => (needExplore && otherPathIds.length
      ? buildTalentGraph(graphOptionsFromCharacter(
        { caminoHeroico, caminoRadiante, ascendencia, caminoMetal, caminoInicial, poderes }, [...extraPaths, ...otherPathIds], rules,
      ), rules)
      : null),
    [needExplore, otherPathIds, extraPaths, caminoHeroico, caminoRadiante, ascendencia, caminoMetal, caminoInicial, poderes, rules],
  )
  const exploreEval = useMemo(() => (exploreGraph ? evaluate(exploreGraph, tState) : null), [exploreGraph, tState])
  const exploreModels = useMemo(
    () => (exploreGraph ? buildPathModels(exploreGraph).filter((m) => m.kind === 'heroico' && otherPathIds.includes(m.pathId)) : []),
    [exploreGraph, otherPathIds],
  )
  const ctxFor = (id: string | null | undefined): { graph: TalentGraph; evaluation: TalentEvaluation } | null => {
    if (!id) return null
    if (graph.byId.has(id)) return { graph, evaluation }
    if (exploreGraph && exploreEval && exploreGraph.byId.has(id)) return { graph: exploreGraph, evaluation: exploreEval }
    return null
  }

  // ── goal route ───────────────────────────────────────────────────────────
  const goalGraph = goal ? (graph.byId.has(goal.nodeId) ? graph : exploreGraph?.byId.has(goal.nodeId) ? exploreGraph : null) : null
  const route = useMemo(
    () => (goal && goalGraph ? cheapestRoute(goalGraph, tState, goal.nodeId, { choices: goal.choices }) : null),
    [goal, goalGraph, tState],
  )
  const goalNode = goal && goalGraph ? goalGraph.byId.get(goal.nodeId) ?? null : null
  const activeRoute = route && route.reachable && !route.owned ? route : null
  const stepOf = useMemo(() => new Map(activeRoute?.steps.map((s, i) => [s.nodeId, i + 1]) ?? []), [activeRoute])
  const targetId = activeRoute?.targetId ?? null
  const learnedSet = evaluation.learned
  const edgeStatus = useMemo<EdgeStatusFn>(() => {
    const names = new Set(activeRoute?.steps.map((s) => s.name) ?? [])
    const alts = new Map(activeRoute?.alternatives.map((a) => [a.key, a.chosen]) ?? [])
    return (parentName, _parentId, childId, clauseIndex) => {
      if (stepOf.has(childId)) {
        const chosen = alts.get(`${childId}#${clauseIndex}`)
        if ((!chosen || chosen === parentName) && (names.has(parentName) || learnedSet.has(parentName))) return 'route'
      }
      return learnedSet.has(parentName) ? 'met' : 'pending'
    }
  }, [activeRoute, stepOf, learnedSet])

  // ── mutations (optimistic, built from the latest cached character) ───────
  const talentosMutation = useMutation({
    mutationFn: (names: string[]) => {
      const cur = qc.getQueryData<Character>(qKey) ?? character
      return charactersApi.update(cId, charId, { ...(cur as UpdateCharacterRequest), talentos: JSON.stringify(names) })
    },
    onMutate: async (names: string[]) => {
      await qc.cancelQueries({ queryKey: qKey })
      const prev = qc.getQueryData<Character>(qKey)
      if (prev) qc.setQueryData<Character>(qKey, { ...prev, talentos: JSON.stringify(names) })
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qKey, ctx.prev)
      setLiveMsg('No se pudo guardar el cambio de talentos.')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qKey })
      qc.invalidateQueries({ queryKey: ['characters', cId] })
    },
  })
  const idealesMutation = useMutation({
    mutationFn: (value: number) => {
      const cur = qc.getQueryData<Character>(qKey) ?? character
      return charactersApi.update(cId, charId, { ...(cur as UpdateCharacterRequest), idealesJurados: value })
    },
    onMutate: async (value: number) => {
      await qc.cancelQueries({ queryKey: qKey })
      const prev = qc.getQueryData<Character>(qKey)
      if (prev) qc.setQueryData<Character>(qKey, { ...prev, idealesJurados: value })
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(qKey, ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: qKey }),
  })
  // «Beber vial» (T31): the metals of the vial go up as `beber-vial` and the sheet closes, as on the character sheet. Optimistic by prefix of the cache (the key of
  // this page has 3 elements and the ficha's 4: the prefix covers both, §2) with the rule of the vial that vial.ts shares with its sheet; the refetch brings the
  // server's own values. Only the last of several vials in flight refetches, so a slow answer never puts an old value back on screen
  const vialKey = ['vial', cId, charId] as const
  const beberVialMutation = useMutation({
    mutationKey: vialKey,
    mutationFn: (metales: string[]) => charactersApi.beberVial(cId, charId, metales),
    onMutate: async (metales: string[]) => {
      await qc.cancelQueries({ queryKey: qKey })
      const previas = qc.getQueriesData<Character>({ queryKey: qKey })
      qc.setQueriesData<Character>({ queryKey: qKey }, (old) => old && conVialBebido(old, metales))
      return { previas }
    },
    onError: (_e, _v, ctx) => { ctx?.previas.forEach(([key, data]) => qc.setQueryData(key, data)) },
    onSettled: () => {
      if (qc.isMutating({ mutationKey: vialKey }) > 1) return // another vial is still on its way: it refreshes when it settles
      qc.invalidateQueries({ queryKey: qKey })
      qc.invalidateQueries({ queryKey: ['characters', cId] })
    },
  })
  // The vial is offered to its owner and the director, and only to a character with a power it acts upon (alomancy, atium aside)
  const onBeberVial = canEditIdeals && poderes.some(esPoderDelVial) ? () => setVialOpen(true) : undefined
  const busy = talentosMutation.isPending

  // scroll to a talent after switching to the map (ref written in handlers, read after render)
  useEffect(() => {
    const id = pendingScroll.current
    if (!id) return
    const el = document.getElementById(cellDomId(id))
    if (!el) return
    pendingScroll.current = null
    el.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' })
    el.focus({ preventScroll: true })
  })

  // ── actions ──────────────────────────────────────────────────────────────
  const setMode = (m: Mode) => {
    setModeState(m)
    writeStore(vistaKey, m)
    setSearchParams((prev) => { const n = new URLSearchParams(prev); n.set('vista', m); return n }, { replace: true })
  }
  const saveGoal = (g: Goal | null) => { setGoalState(g); writeStore(goalKey, g) }
  const budgetTail = (names: string[]) => {
    const b = talentBudget({ level: character.level, ascendencia, talentos: names }, graph)
    const parts = [
      b.excess > 0 ? `Tienes ${b.excess} ${plural(b.excess, 'talento', 'talentos')} de más.`
        : b.remaining > 0 ? (b.remaining === 1 ? 'Te queda 1 elección.' : `Te quedan ${b.remaining} elecciones.`)
        : 'No te quedan elecciones.',
    ]
    if (b.missing.length) parts.push(`Falta una elección obligatoria: ${b.missing.map((r) => r.label).join(', ')}.`)
    return parts.join(' ')
  }
  const learnName = (name: string) => {
    const next = withTalent(stored, name)
    const reached = !!goalNode && goalNode.name === name
    talentosMutation.mutate(next, {
      onSuccess: () => setLiveMsg(`Aprendido: ${name}.${reached ? ' Objetivo conseguido.' : ''} ${budgetTail(next)}`),
    })
    if (reached) saveGoal(null)
  }
  const requestLearn = (nodeId: string) => {
    const ctx = ctxFor(nodeId)
    const node = ctx?.graph.byId.get(nodeId)
    const ev = ctx?.evaluation.nodes.get(nodeId)
    if (!node || !ev || ev.state !== 'available') return
    const story = ev.gates.filter((g): g is Extract<Gate, { kind: 'story' }> => g.kind === 'story' && g.status === 'confirm')
    if (story.length) setDjConfirm({ name: node.name, conditions: story.map((g) => g.condition), keys: story.map((g) => g.key) })
    else learnName(node.name)
  }
  const requestForget = (nodeId: string) => {
    const node = graph.byId.get(nodeId)
    if (!node) return
    const res = cascadeRemove(graph, tState, node.name)
    if (!res.blocked) setForgetConfirm({ ...res, name: node.name })
  }
  const requestSetGoal = (nodeId: string, choices: Record<string, string> = {}) => {
    const next = { nodeId, choices }
    if (goal && goal.nodeId !== nodeId) { setGoalConfirm({ kind: 'replace', goal: next }); return }
    saveGoal(next)
    const name = ctxFor(nodeId)?.graph.byId.get(nodeId)?.name
    setLiveMsg(`Objetivo fijado: ${name ?? 'talento'}. Su ruta aparece numerada en el árbol.`)
  }
  const activateForma = (nombre: string) => {
    talentosMutation.mutate(withFormaActiva(stored, nombre), { onSuccess: () => setLiveMsg(`Forma activa: ${nombre}.`) })
    setFormaOpen(false)
  }
  const toggleLamina = (treeId: string) => {
    const n = new Set(openLaminas)
    if (n.has(treeId)) n.delete(treeId)
    else n.add(treeId)
    setOpenLaminas(n)
    writeStore(lamKey, [...n])
  }
  const closeLaminas = (treeIds: string[]) => {
    const n = new Set([...openLaminas].filter((t) => !treeIds.includes(t)))
    setOpenLaminas(n)
    writeStore(lamKey, [...n])
  }
  const showInTree = (nodeId: string) => {
    if (!graph.byId.has(nodeId)) setShowOthers(true)
    setMode('arbol')
    setSelectedId(nodeId)
    pendingScroll.current = nodeId
  }
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    el?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  // ── derived bits for the bars ────────────────────────────────────────────
  const hasAnything = models.length > 0
  const myCount = [...evaluation.learned].filter((n) => graph.byName.has(n)).length
  const formasMissing = budget.missing.some((r) => r.accepts.includes('formas'))
  const otherMissing = budget.missing.filter((r) => !r.accepts.includes('formas'))
  const surgeRank = (surge: string) => {
    for (let i = 1; i <= 6; i++) {
      const k = `habilidadPersonalizada${i}` as `habilidadPersonalizada${1 | 2 | 3 | 4 | 5 | 6}`
      if (character[k] === surge) return Number(character[`${k}Valor`] ?? 0) || 0
    }
    return 0
  }
  const cantorAccent = accentOf(CANTOR_COLOR)
  const formasDisponibles = useMemo(() => getFormasDisponibles([...evaluation.learned]), [evaluation.learned])
  const formaData = formasDisponibles.find((f) => f.nombre === evaluation.formaActiva)
  const ideales = character.idealesJurados ?? 0

  const sheetCtx = ctxFor(sheetId)

  const atlasCommon = {
    level: character.level, contentW, edgeStatus, stepOf, targetId, selectedId,
    onSelect: setSelectedId, openLaminas, onToggleLamina: toggleLamina, onCloseLaminas: closeLaminas,
    onOpenSheet: setSheetId, onLearn: requestLearn, onSetGoal: (id: string) => requestSetGoal(id),
    onRemoveGoal: () => setGoalConfirm({ kind: 'remove' }), busy, surgeRank, state: tState,
  }

  const forgetCount = forgetConfirm ? forgetConfirm.removed.length || 1 : 0

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* ── Hero header — scrolls with the page ─────────────────────────── */}
      <CharacterHero
        characterId={character.id}
        style={{ borderRadius: fromTablet(radius.lg), marginTop: fromTablet(16), borderBottom: 'none' }}
      >
        <p style={{ ...eyebrow, color: onGemSoft, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Sparkles size={14} aria-hidden />
          Talentos
        </p>
        <h1 style={{ ...titleText, fontSize: fs['2xl'], color: onGem, marginBottom: 14, overflowWrap: 'anywhere' }}>
          {character.name}
        </h1>
        <CharacterIdentityPills
          character={character}
          variant="hero"
          leading={<span style={{ ...heroPill, fontVariantNumeric: 'tabular-nums' }}>Nv. {character.level}</span>}
          between={extraPaths.map((pid) => {
            const p = rules.caminosHeroicos.find((x) => x.id === pid)
            return p ? <span key={pid} style={heroPill}><HeroicPathIcon id={p.id} size={13} />{p.name}</span> : null
          })}
        />
      </CharacterHero>

      {/* ── Sticky bar: mode + budget chip, goal strip ──────────────────── */}
      {hasAnything && (
        // translateZ(0) forces its own compositor layer: some WebKit builds otherwise fail to render
        // backdrop-filter on a translucent `position: sticky` bar, leaving the page's own scrolled
        // content legible (not blurred) through it right under the fixed top bar — this is the one
        // sticky layer under the top bar; the lámina header below is a plain, solid, non-sticky card.
        <div className="sticky-under-topbar glass" style={{ padding: '6px 16px', borderBottom: `1px solid ${c.border}`, transform: 'translateZ(0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Segmented<Mode>
              ariaLabel="Vista de talentos"
              value={mode}
              onChange={setMode}
              style={{ flex: '1 1 auto', minWidth: 0 }}
              options={[
                { value: 'arbol', label: 'Árbol', ariaLabel: 'Árbol: planificar' },
                {
                  value: 'releer',
                  ariaLabel: `Mis talentos, ${myCount}`,
                  label: (
                    <>
                      Mis talentos
                      <span aria-hidden style={{ fontSize: fs.xs, fontWeight: 700, color: c.muted, background: c.s3, borderRadius: radius.full, padding: '0 7px', lineHeight: '18px', fontVariantNumeric: 'tabular-nums' }}>{myCount}</span>
                    </>
                  ),
                },
              ]}
            />
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setBudgetOpen(true)}
              aria-label={`Presupuesto: ${budget.used} de ${budget.allowed} talentos${budget.excess > 0 ? `, ${budget.excess} de más` : budget.remaining > 0 ? `, falta ${budget.remaining}` : ''}. Ver desglose`}
              className="ui-btn ui-btn--secondary"
              style={{
                flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 44, padding: '0 10px',
                borderRadius: radius.md, border: `1px solid ${c.border}`, background: c.s1, color: c.muted, fontSize: fs.sm, cursor: 'pointer',
              }}
            >
              <span className="hide-mobile">Talentos</span>
              <strong style={{ color: c.text, fontVariantNumeric: 'tabular-nums' }}>{budget.used}/{budget.allowed}</strong>
              {budget.excess > 0 ? (
                <span style={{ fontSize: fs.eyebrow, fontWeight: 750, color: tone.topacio.fg, background: tone.topacio.bg, border: `1px solid ${tone.topacio.border}`, borderRadius: radius.full, padding: '0 6px', lineHeight: '17px' }}>+{budget.excess}</span>
              ) : budget.remaining > 0 ? (
                <span style={{ fontSize: fs.eyebrow, fontWeight: 750, color: tone.zafiro.fg, background: tone.zafiro.bg, border: `1px solid ${tone.zafiro.border}`, borderRadius: radius.full, padding: '0 6px', lineHeight: '17px', whiteSpace: 'nowrap' }}>falta {budget.remaining}</span>
              ) : null}
            </button>
          </div>
          {goal && goalNode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => setSheetId(goal.nodeId)}
                className="ui-btn"
                style={{
                  flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, minHeight: 40, padding: '0 10px',
                  borderRadius: radius.sm, background: tone.brand.bg, border: `1px solid ${tone.brand.border}`, color: c.text,
                  fontSize: fs.sm, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <Target size={16} aria-hidden style={{ color: c.brand, flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                  <span className="sr-only">Objetivo: </span>
                  <strong style={{ color: c.brandLight }}>{goalNode.name}</strong>
                  <span style={{ color: c.muted, fontSize: fs.xs + 0.5 }}>
                    {activeRoute
                      ? ` · ${activeRoute.talents} ${plural(activeRoute.talents, 'talento', 'talentos')} · ${wide ? 'desde ' : ''}Nv ${activeRoute.earliestLevel}`
                      : route?.owned ? ' · conseguido' : ' · sin ruta con tus caminos'}
                  </span>
                </span>
                {wide && <ChevronRight size={16} aria-hidden style={{ marginLeft: 'auto', flexShrink: 0, color: c.muted }} />}
              </button>
              <IconButton label="Quitar objetivo" size={40} onClick={() => setGoalConfirm({ kind: 'remove' })} aria-haspopup="dialog">
                <X size={18} aria-hidden />
              </IconButton>
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '16px 16px 64px' }}>
        {!hasAnything && (
          <EmptyState
            icon={<Sparkles size={24} aria-hidden />}
            title="Sin camino asignado"
            description={cfg.textos.vacioTalentos}
          />
        )}

        {/* ── Warnings: mandatory choice missing, excess (same text as always) ── */}
        {hasAnything && formasMissing && (
          <div role="status" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: tone.zafiro.bg, border: `1px solid ${tone.zafiro.border}`, borderRadius: radius.md, padding: '12px 14px', marginBottom: 12 }}>
            <Info size={18} aria-hidden style={{ color: tone.zafiro.fg, flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: fs.sm + 1, fontWeight: 700, color: tone.zafiro.fg }}>Te falta 1 talento de Formas</p>
              <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45 }}>Obligatorio por ascendencia cantora (nivel 1).</p>
            </div>
            {mode === 'arbol' && (
              <Button variant="ghost" size="sm" onClick={() => scrollToSection('atlas-cantor-section')} style={{ color: tone.zafiro.fg, flexShrink: 0 }}>Ver cantor</Button>
            )}
          </div>
        )}
        {hasAnything && otherMissing.length > 0 && (
          <p role="status" style={{ fontSize: fs.sm, color: tone.zafiro.fg, background: tone.zafiro.bg, border: `1px solid ${tone.zafiro.border}`, borderRadius: radius.md, padding: '10px 14px', marginBottom: 12 }}>
            Falta una elección obligatoria: {otherMissing.map((r) => r.label).join(' · ')}
          </p>
        )}
        {budget.excessText && (
          <div role="status" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: tone.topacio.bg, border: `1px solid ${tone.topacio.border}`, borderRadius: radius.md, padding: '12px 16px', marginBottom: 16 }}>
            <TriangleAlert size={20} aria-hidden style={{ color: tone.topacio.fg, flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: fs.sm + 1, fontWeight: 700, color: tone.topacio.fg, marginBottom: 2 }}>Exceso de talentos</p>
              <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>{budget.excessText}</p>
            </div>
          </div>
        )}
        {talentosMutation.isError && <ErrorMessage message="No se pudo guardar el último cambio de talentos. Inténtalo de nuevo." style={{ marginBottom: 12 }} />}
        {beberVialMutation.isError && <ErrorMessage message="No se ha podido beber el vial. Inténtalo de nuevo." style={{ marginBottom: 12 }} />}

        {/* ── MIS TALENTOS (reread) ─────────────────────────────────────── */}
        {hasAnything && mode === 'releer' && (
          <MyTalents
            character={character}
            graph={graph}
            evaluation={evaluation}
            onOpenTalent={setSheetId}
            onShowInTree={showInTree}
            onChangeForma={graph.isCantor && cfg.features.formasCantor ? () => setFormaOpen(true) : undefined}
            onBeberVial={onBeberVial}
          />
        )}

        {/* ── ÁRBOL (plan) ──────────────────────────────────────────────── */}
        {hasAnything && mode === 'arbol' && (
          <>
            <StateLegend />
            {models.map((m) => {
              if (m.kind === 'radiante') {
                return (
                  <PathAtlas
                    key={m.id}
                    model={m}
                    graph={graph}
                    evaluation={evaluation}
                    {...atlasCommon}
                    keyOwnedNote={cfg.features.idealesJurados
                      ? (ideales > 0 ? `${ideales} ${plural(ideales, 'Ideal jurado', 'Ideales jurados')}` : 'cuenta como jurado')
                      : undefined}
                    outro={!m.noJugable && cfg.features.idealesJurados && (
                      <IdealesControl value={ideales} canEdit={canEditIdeals} onChange={(v) => idealesMutation.mutate(v)} saving={idealesMutation.isPending} />
                    )}
                  />
                )
              }
              if (m.kind === 'cantor') {
                return (
                  <PathAtlas
                    key={m.id}
                    model={m}
                    graph={graph}
                    evaluation={evaluation}
                    {...atlasCommon}
                    keyExtra={cfg.features.formasCantor ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: c.muted, fontWeight: 600 }}>
                          <Music size={13} aria-hidden />
                          Forma: <strong style={{ color: c.text }}>{evaluation.formaActiva ?? 'ninguna'}</strong>
                        </span>
                        <Button variant="secondary" size="sm" onClick={() => setFormaOpen(true)} aria-haspopup="dialog" aria-label="Cambiar forma activa">Cambiar</Button>
                      </span>
                    ) : undefined}
                    intro={
                      <>
                        {formaData?.esPoder && (
                          <p style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: fs.sm, color: tone.heliodoro.fg, fontStyle: 'italic', marginBottom: 8 }}>
                            <TriangleAlert size={14} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
                            Forma de poder — riesgo de influencia de Odium
                          </p>
                        )}
                        {!evaluation.formaActivaValida && evaluation.formaActiva && (
                          <p role="status" style={{ fontSize: fs.sm, color: tone.topacio.fg, marginBottom: 8 }}>
                            La forma activa «{evaluation.formaActiva}» ya no está desbloqueada por tus talentos.
                          </p>
                        )}
                      </>
                    }
                    plateNote={formasMissing && (
                      <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: fs.xs + 0.5, fontWeight: 650, color: tone.zafiro.fg, margin: '2px 0 6px' }}>
                        <Info size={14} aria-hidden />
                        Elige 1 talento de Formas (obligatorio)
                      </p>
                    )}
                  />
                )
              }
              if (m.kind === 'caminoInvestido') {
                return (
                  <PathAtlas
                    key={m.id}
                    model={m}
                    graph={graph}
                    evaluation={evaluation}
                    {...atlasCommon}
                    intro={<ResumenCamino model={m} graph={graph} evaluation={evaluation} nombreMeta={rules.nombreMeta ?? 'Meta'} />}
                  />
                )
              }
              return <PathAtlas key={m.id} model={m} graph={graph} evaluation={evaluation} {...atlasCommon} />
            })}

            {/* ── Other heroic paths (explore; their key talent costs 1 talent) ── */}
            {otherPathIds.length > 0 && (
              <section aria-labelledby="otros-caminos-t" style={{ marginTop: 32 }}>
                <h2 id="otros-caminos-t" style={{ margin: 0 }}>
                  <button
                    type="button"
                    aria-expanded={showOthers}
                    aria-controls="otros-caminos"
                    onClick={() => setShowOthers((v) => !v)}
                    className="ui-row"
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, padding: '10px 14px', textAlign: 'left',
                      background: c.s1, border: `1px solid ${c.border}`, borderRadius: radius.lg, cursor: 'pointer', color: c.text,
                    }}
                  >
                    <Compass size={20} aria-hidden style={{ color: c.gold, flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2 }}>Otros caminos heroicos</span>
                      <span style={{ display: 'block', fontFamily: font.ui, fontSize: fs.sm, fontWeight: 500, color: c.muted, marginTop: 2 }}>
                        Entras en uno aprendiendo su talento principal (cuesta 1 talento)
                      </span>
                    </span>
                    <ChevronDown size={18} aria-hidden style={{ color: c.subtle, transform: showOthers ? 'rotate(180deg)' : undefined, transition: 'transform var(--dur-2)' }} />
                  </button>
                </h2>
                {showOthers && (
                  <div id="otros-caminos">
                    {exploreGraph && exploreEval && exploreModels.map((m) => (
                      <PathAtlas key={m.id} model={m} graph={exploreGraph} evaluation={exploreEval} explore headingLevel={3} {...atlasCommon} />
                    ))}
                  </div>
                )}
              </section>
            )}

            <BookLegend defaultOpen={wide} />
          </>
        )}
      </div>

      {/* live region: learn / forget / goal */}
      <p role="status" className="sr-only">{liveMsg}</p>

      {/* ── Sheets and dialogs ───────────────────────────────────────────── */}
      {sheetId && sheetCtx && (
        <TalentSheet
          key={sheetId}
          nodeId={sheetId}
          graph={sheetCtx.graph}
          evaluation={sheetCtx.evaluation}
          state={tState}
          level={character.level}
          isGoal={goal?.nodeId === sheetId}
          initialChoices={goal?.nodeId === sheetId ? goal.choices : {}}
          busy={busy}
          onClose={() => setSheetId(null)}
          onOpenNode={setSheetId}
          onLearn={requestLearn}
          onForget={requestForget}
          onSetGoal={requestSetGoal}
          onRemoveGoal={() => setGoalConfirm({ kind: 'remove' })}
          onChoicesChange={(choices) => { if (goal?.nodeId === sheetId) saveGoal({ nodeId: sheetId, choices }) }}
          onActivateForma={activateForma}
        />
      )}

      <BudgetSheet open={budgetOpen} onClose={() => setBudgetOpen(false)} budget={budget} route={route} level={character.level} />

      {/* The vial (T31): mounted only while it is open; the metals it holds go up as `beber-vial` and the page closes it, like the pickers of the character sheet */}
      {vialOpen && (
        <Suspense fallback={<Sheet open onClose={() => setVialOpen(false)} title="Cargando…" maxWidth={480}><Spinner /></Sheet>}>
          <BeberVialSheet
            open
            onClose={() => setVialOpen(false)}
            character={character}
            isGm={isGm}
            onBeber={(metales) => { setVialOpen(false); beberVialMutation.mutate(metales) }}
          />
        </Suspense>
      )}

      {cfg.features.formasCantor && (
        <FormaPickerSheet
          open={formaOpen}
          onClose={() => setFormaOpen(false)}
          formas={formasDisponibles}
          activa={evaluation.formaActiva}
          accent={cantorAccent}
          onActivate={activateForma}
        />
      )}

      <ConfirmDialog
        open={!!djConfirm}
        tone="brand"
        icon="warning"
        title="¿Lo confirma tu DJ?"
        message={djConfirm && (
          <>
            «{djConfirm.name}» exige una condición de historia: <strong style={{ color: c.text }}>{djConfirm.conditions.join('; ')}</strong>.
            {' '}Apréndelo solo si tu DJ confirma que tu personaje la cumple. Quedará anotado en este dispositivo.
          </>
        )}
        confirmLabel="Sí, lo confirma"
        onConfirm={() => {
          if (djConfirm) {
            const keys = [...new Set([...confirmedStory, ...djConfirm.keys])]
            setConfirmedStory(keys)
            writeStore(djKey, keys)
            learnName(djConfirm.name)
          }
          setDjConfirm(null)
        }}
        onCancel={() => setDjConfirm(null)}
      />

      <ConfirmDialog
        open={!!forgetConfirm}
        title={forgetCount > 1 ? `¿Olvidar ${forgetCount} talentos?` : '¿Olvidar este talento?'}
        message={forgetConfirm && (
          <>
            {forgetCount > 1
              ? `Se olvidará «${forgetConfirm.name}» y también ${forgetCount - 1} ${forgetCount - 1 > 1 ? 'talentos que dependen' : 'talento que depende'} de él: ${forgetConfirm.alsoRemoved.join(', ')}.`
              : `Se olvidará «${forgetConfirm.name}».`}
            {forgetConfirm.formaInvalidada && ` Además se desactivará la forma activa «${forgetConfirm.formaInvalidada}».`}
          </>
        )}
        confirmLabel={forgetCount > 1 ? `Olvidar ${forgetCount} talentos` : 'Olvidar talento'}
        onConfirm={() => {
          if (forgetConfirm) {
            const res = forgetConfirm
            talentosMutation.mutate(res.talentos, {
              onSuccess: () => setLiveMsg(`${plural(res.removed.length, 'Olvidado', 'Olvidados')}: ${res.removed.join(', ')}. ${budgetTail(res.talentos)}`),
            })
          }
          setForgetConfirm(null)
          setSheetId(null)
        }}
        onCancel={() => setForgetConfirm(null)}
      />

      <ConfirmDialog
        open={!!goalConfirm}
        tone={goalConfirm?.kind === 'replace' ? 'brand' : 'danger'}
        icon={goalConfirm?.kind === 'replace' ? 'warning' : undefined}
        title={goalConfirm?.kind === 'replace' ? '¿Cambiar de objetivo?' : '¿Quitar el objetivo?'}
        message={goalConfirm?.kind === 'replace'
          ? `«${ctxFor(goalConfirm.goal.nodeId)?.graph.byId.get(goalConfirm.goal.nodeId)?.name ?? 'El talento'}» sustituirá a «${goalNode?.name ?? 'tu objetivo'}».`
          : `Dejarás de ver la ruta hacia «${goalNode?.name ?? 'tu objetivo'}». Tus talentos no cambian.`}
        confirmLabel={goalConfirm?.kind === 'replace' ? 'Cambiar objetivo' : 'Quitar objetivo'}
        onConfirm={() => {
          if (goalConfirm?.kind === 'replace') {
            saveGoal(goalConfirm.goal)
            setLiveMsg('Objetivo cambiado. Su ruta aparece numerada en el árbol.')
          } else {
            saveGoal(null)
            setLiveMsg('Objetivo quitado.')
          }
          setGoalConfirm(null)
        }}
        onCancel={() => setGoalConfirm(null)}
      />
    </div>
  )
}

// ── Resumen del camino Investido con árbol plano (camino de nacido del metal) ────────────────────────────────────────

/**
 * Under the header of the metalborn path: what its goal still keeps closed. The talents of the path and the trees of its powers stay closed until the goal
 * is done (L.75 / PDF 81, Q26) and the map says so with hatched cells; this says why, which trees and how to open them. The gates are the engine's own (the
 * goal gate of each tree), so the note never disagrees with the map. Nothing is shown when no tree of the path is closed.
 */
function ResumenCamino({ model, graph, evaluation, nombreMeta }: { model: PathModel; graph: TalentGraph; evaluation: TalentEvaluation; nombreMeta: string }) {
  const cerrado = (treeId: string): boolean => {
    for (const id of graph.treeById.get(treeId)?.nodeIds ?? []) {
      const g = evaluation.nodes.get(id)?.gates.find((x): x is Extract<Gate, { kind: 'meta' }> => x.kind === 'meta')
      if (g) return g.status !== 'met'
    }
    return false
  }
  const camino = cerrado(model.id)
  const poderes = model.plates.filter((p) => p.kind === 'poder' && cerrado(p.tree.id)).map((p) => p.tree.section)
  const total = (camino ? 1 : 0) + poderes.length
  if (total === 0) return null
  // «tu camino, Alomancia de acero y Alomancia de hierro»; with more than three, «tu camino y 7 poderes»
  const items = total > 3 ? [...(camino ? ['tu camino'] : []), `${poderes.length} ${plural(poderes.length, 'poder', 'poderes')}`] : [...(camino ? ['tu camino'] : []), ...poderes]
  const lista = items.length > 1 ? `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}` : items[0]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: tone.zafiro.bg, border: `1px solid ${tone.zafiro.border}`, borderRadius: radius.md, padding: '10px 12px', marginBottom: 12 }}>
      <Info size={16} aria-hidden style={{ color: tone.zafiro.fg, flexShrink: 0, marginTop: 2 }} />
      <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45, minWidth: 0 }}>
        <strong style={{ color: c.text }}>{nombreMeta} pendiente.</strong>{' '}
        Hasta que la completes siguen cerrados (casillas rayadas) los talentos de {lista}. Se completa al concluir la meta en Metas.
      </p>
    </div>
  )
}

// ── Ideales jurados (GM or owner) ──────────────────────────────────────────

function IdealesControl({ value, canEdit, onChange, saving }: { value: number; canEdit: boolean; onChange: (v: number) => void; saving: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px 8px 12px', border: `1px solid ${c.border}`, borderRadius: radius.md, background: c.s1, marginTop: 14 }}>
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.sm + 1, fontWeight: 650, color: c.text }}>
          <IdealGlyph size={14} />
          Ideales jurados
          {saving && <span style={{ fontSize: fs.xs, color: c.subtle, fontWeight: 500 }}>· guardando…</span>}
        </p>
        <p style={{ fontSize: fs.xs + 0.5, color: c.muted, lineHeight: 1.45, marginTop: 2 }}>
          {value === 0
            ? '0 = sin marcar: un Ideal aprendido cuenta como jurado.'
            : 'Los Ideales aprendidos por encima de este número no están jurados (meta con la DJ).'}
        </p>
      </div>
      {canEdit ? (
        <Stepper label="Ideales jurados" value={value} min={0} max={5} onChange={onChange} size="sm" />
      ) : (
        <span style={{ fontSize: fs.lg, fontWeight: 700, color: c.text, fontVariantNumeric: 'tabular-nums' }} aria-label={`Ideales jurados: ${value}`}>{value}</span>
      )}
    </div>
  )
}

// ── Legends ────────────────────────────────────────────────────────────────

const ACCENT_NEUTRAL = accentOf('#60a5fa')

function StateLegend() {
  const { features } = useWorldConfig()
  const item: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: fs.xs, color: c.muted }
  const box = (look: CSSProperties, child: ReactNode) => (
    <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 2, minWidth: 30, height: 20, padding: '0 4px', borderRadius: 5, ...look }}>{child}</span>
  )
  const a = ACCENT_NEUTRAL
  return (
    <div style={{ background: c.s1, border: `1px solid ${c.border}`, borderRadius: radius.md, padding: '10px 12px', marginBottom: 4 }}>
      <p className="sr-only">Leyenda de estados de las casillas</p>
      <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
        <li style={item}>{box({ background: a.wash(15), border: `1.5px solid ${a.borderStrong}` }, <CellMarkView mark={{ kind: 'learned', granted: false }} accent={a} compact={false} />)}aprendido</li>
        <li style={item}>{box({ background: a.wash(6), border: `1.5px dotted ${a.borderStrong}` }, <CellMarkView mark={{ kind: 'elsewhere' }} accent={a} compact={false} />)}en otra rama</li>
        <li style={item}>{box({ background: c.s1, border: `1.5px dashed ${a.border}` }, <CellMarkView mark={{ kind: 'available', dj: false }} accent={a} compact={false} />)}disponible</li>
        <li style={item}>{box({ background: c.s1, border: `1px solid ${c.borderBright}` }, <CellMarkView mark={{ kind: 'locked', distance: 2, badge: null, minLevel: 1 }} accent={a} compact={false} />)}a 2 talentos</li>
        <li style={item}>{box({ background: c.s3, border: `1px solid ${c.borderBright}` }, <CellMarkView mark={{ kind: 'locked', distance: 2, badge: 'nivel', minLevel: 6 }} accent={a} compact={false} />)}nivel 6 como pronto</li>
        {features.artesMetalicas && (
          <li style={item}>{box(META_LOCKED, <CellMarkView mark={{ kind: 'locked', distance: 2, badge: 'meta', minLevel: 1, poderId: 'alomancia:acero' }} accent={a} compact={false} />)}bloqueado hasta completar su meta</li>
        )}
        <li style={item}>{box({ background: c.s1, border: `1px solid ${c.borderBright}` }, <span style={{ fontSize: fs.eyebrow, fontWeight: 750, color: c.muted }}>DJ</span>)}lo decide la DJ</li>
        {features.idealesJurados && (
          <li style={item}>{box({ background: c.s1, border: `1px solid ${c.borderBright}` }, <IdealGlyph size={12} />)}jurar un Ideal</li>
        )}
        <li style={item}>
          <span aria-hidden style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${c.subtle}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: fs.eyebrow, fontWeight: 750, color: c.muted, lineHeight: 1 }}>o</span>
          basta uno
        </li>
      </ul>
      <p style={{ fontSize: fs.xs, color: c.subtle, fontStyle: 'italic', marginTop: 6 }}>
        Línea = requisito · la posición no implica requisito · toca una casilla para ver qué falta
      </p>
    </div>
  )
}

const LEGEND: { type: ActivationType; text: string }[] = [
  { type: 'action1', text: 'Cuesta 1 acción en tu turno.' },
  { type: 'action2', text: 'Cuesta 2 acciones en tu turno.' },
  { type: 'action3', text: 'Cuesta 3 acciones: todo tu turno.' },
  { type: 'free', text: 'No gasta acciones.' },
  { type: 'reaction', text: 'Se usa fuera de tu turno, como respuesta a algo.' },
  { type: 'special', text: 'Se activa como indica su texto.' },
  { type: 'passive', text: 'Efecto permanente, sin activación.' },
]

function BookLegend({ defaultOpen }: { defaultOpen: boolean }) {
  return (
    <Disclosure title="Leyenda del libro · iconos de activación" defaultOpen={defaultOpen} style={{ marginTop: 32 }} headingLevel={2}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fs.sm }}>
        <caption className="sr-only">Iconos de activación de los talentos</caption>
        <thead>
          <tr>
            <th scope="col" style={{ ...eyebrow, textAlign: 'left', padding: '0 8px 6px 0' }}>Icono</th>
            <th scope="col" style={{ ...eyebrow, textAlign: 'left', padding: '0 0 6px' }}>Significado</th>
          </tr>
        </thead>
        <tbody>
          {LEGEND.map((l) => (
            <tr key={l.type} style={{ borderTop: `1px solid ${c.border}` }}>
              <td style={{ padding: '8px 8px 8px 0', whiteSpace: 'nowrap' }}><TalentActivation type={l.type} /></td>
              <td style={{ padding: '8px 0', color: c.muted, lineHeight: 1.4 }}>{l.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: fs.xs + 0.5, color: c.muted, marginTop: 10, lineHeight: 1.5 }}>
        Como en el libro, cada línea une un talento con su requisito. Un círculo «o» significa que basta con uno de los requisitos;
        dos líneas sin «o» significan que hacen falta los dos. Que una casilla esté debajo de otra no implica que dependa de ella.
      </p>
    </Disclosure>
  )
}
