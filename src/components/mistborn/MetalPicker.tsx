/**
 * Picker of the metals of a metalborn path (Nacidos de la bruma, §7.5): the 4×4 table of the metals plus atium, filtered by the
 * metals of the path in the era of the campaign (`METALES_POR_CAMINO_Y_ERA`, the literal table of L.372 / PDF 378) and by the
 * paths whose main talent unlocks each power (`PoderDef.caminos`). The era alone is not enough: in Era 1 the brumoso has no gold
 * while the nacido de la bruma and the feruquimista do (L.167 / PDF 173), and atium only exists in Era 1.
 *
 * How the powers are chosen depends on the path (`modo`, `CaminoNacidoDelMetal.seleccionMeta`):
 * - 'uno' (brumoso, ferrin): one power (L.135 / PDF 141; L.150 / PDF 156).
 * - 'pareja' (nacido de la bruma): every alomantic power of the era, nascent; the director picks the Empujón/Tirón pair the first
 *   goal trains (L.141 / PDF 147).
 * - 'puro-aleacion-o-atium' (feruquimista): every feruchemical power of the era, nascent; a pure metal and its alloy, or atium, for
 *   the goal (L.146 / PDF 152).
 * - 'uno-por-arte' (nacidoble): one alomantic and one feruchemical power, the same metal or different ones (L.155 / PDF 161).
 * - 'concedido' («Añadir poder», T30, director only): one power the character gets as a reward, with its origin chosen here: a spike, an alloy
 *   of lerasium (Era 1 only) or a medallion (Era 2 only; L.288-295 / PDF 294-301). It does not depend on the path: any metal of the era the origin
 *   allows, never a power the character already has, born complete and without a goal.
 * - `nuevaMeta` (T33, «Nueva meta de nacido del metal», director only): the path already gave every power, so nothing is created. In 'pareja' or
 *   'puro-aleacion-o-atium' mode only the nascent powers that have no goal yet (the ids in `nuevaMeta`) can be chosen for the new goal, and the
 *   rest of the era's table is shown as taken (L.141 / PDF 147; L.146 / PDF 152: «y así sucesivamente»).
 * A metal whose pair is not offered (gold in Era 1, whose alloy electro is not in the table) is chosen alone (Q25). Alomancia de
 * atium is complete from the start and trains no goal (L.177 / PDF 183; L.135 / PDF 141).
 *
 * It only chooses: `onConfirm(poderes, paraMeta)` hands back the powers to create and the ids (`${arte}:${metal}`) the goal trains;
 * the sheet saves them (CharacterDetailPage, `aplicarCaminoMetal`). The powers data come from `useWorldData()` (lazy, §8 risk 6);
 * the picker itself is loaded lazily from components/mistborn/index.ts (§7.4 rule 4).
 */
import { useId, useState, type ReactNode } from 'react'
import { Check, RefreshCw, TriangleAlert } from 'lucide-react'
import { Button, ErrorMessage, Segmented, Sheet, Spinner } from '../ui'
import type { Era, PoderPersonaje } from '../../types'
import type { PoderDef } from '../../data/mistborn/tipos'
import {
  CATEGORIAS_ALOMANCIA, CATEGORIAS_FERUQUIMIA, METALES, METALES_POR_CAMINO_Y_ERA, getMetal,
  type ArteMetal, type CaminoMetalId, type MetalDef, type MetalId,
} from '../../data/mistborn/metales'
import { CAMINOS_NACIDOS_DEL_METAL, type SeleccionMeta } from '../../data/mistborn/caminosNacidosDelMetal'
import { useWorldConfig, useWorldData } from '../../store/campaignStore'
import { buttonReset, c, eyebrow, fs, pill, radius, tone, toneFrom } from '../../theme'
import { FilaOpcion } from './FilaOpcion'
import { MetalGlyph } from './MetalGlyph'
import { NOMBRE_ORIGEN, type OrigenConcedido } from './poderes'

export interface MetalPickerProps {
  open: boolean
  onClose: () => void
  /** Art whose metals are offered; 'ambas' = one power of each art (nacidoble; in 'concedido' mode: the arts the chosen origin allows) */
  arte: ArteMetal | 'ambas'
  /** How the first goal picks its powers (`CaminoNacidoDelMetal.seleccionMeta`), or 'concedido' = «Añadir poder»: a reward of the director whose origin is chosen here */
  modo: SeleccionMeta | 'concedido'
  /** Era of the campaign (`null` = every era) */
  era: Era | null
  /** Metalborn path the powers come from: with the era it decides which metals exist (unused in 'concedido' mode) */
  caminoMetal: string
  /** Power ids (`${arte}:${metal}`) the character keeps from another origin: shown, never offered again */
  yaElegidos: string[]
  /** 'concedido' mode: the arts whose Investida skill has no free cognitive slot; a spike or an alloy of that art waits until the director frees one (Q4) */
  sinHueco?: ArteMetal[]
  /**
   * «Nueva meta de nacido del metal» (T33): ids (`${arte}:${metal}`) of the nascent powers without a goal, the only ones the new goal can train.
   * The character already has all its powers, so `onConfirm` hands back no powers, only the ids of the goal
   */
  nuevaMeta?: string[]
  onConfirm: (poderes: PoderPersonaje[], paraMeta: string[]) => void
}

/**
 * The origins of a power that does not come from the path, with what each one is and where it exists. The alloys of lerasium are only found in
 * Era 1 (L.295 / PDF 301) and the feruchemical medallions are an item of Era 2 (L.293 / PDF 299). No spike, alloy or medallion gives atium (the
 * tables of spikes and medallions have none, L.291 / PDF 297, L.294 / PDF 300; the server rejects it for the alloy and the medallion, §5.3).
 */
const ORIGENES: Record<OrigenConcedido, { corto: string; artes: ArteMetal[]; solo?: Era; texto: string }> = {
  clavo: {
    corto: 'Clavo',
    artes: ['alomancia', 'feruquimia'],
    texto: 'Un clavo hemalúrgico implantado da la versión completa de un poder alomántico o feruquímico y la habilidad Alomancia o Feruquimia, si no la tenías.',
  },
  lerasium: {
    corto: 'Lerasium',
    artes: ['alomancia'],
    solo: 'era1',
    texto: 'Una pepita de aleación de lerasium da el poder alomántico de su metal, completo, y la habilidad Alomancia si no la tenías.',
  },
  medallon: {
    corto: 'Medallón',
    artes: ['feruquimia'],
    solo: 'era2',
    texto: 'Un medallón feruquímico da un poder feruquímico completo con un máximo fijo de 8 cargas. No da la habilidad Feruquimia.',
  },
}
const ORDEN_ORIGENES: OrigenConcedido[] = ['clavo', 'lerasium', 'medallon']

const ARTE: Record<ArteMetal, { nombre: string; poder: string; poderes: string }> = {
  alomancia: { nombre: 'Alomancia', poder: 'poder alomántico', poderes: 'poderes alománticos' },
  feruquimia: { nombre: 'Feruquimia', poder: 'poder feruquímico', poderes: 'poderes feruquímicos' },
}

const id = (arte: ArteMetal, metal: MetalId) => `${arte}:${metal}`
const partes = (poder: string) => poder.split(':') as [ArteMetal, MetalId]
const ordenMetal = (poder: string) => METALES.findIndex((m) => m.id === partes(poder)[1])
const lista = (nombres: string[]) => (nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres.join(''))

/** «Físico · Externo · Empujón» (alomancia; atium «Divino»), «Físico · Velocidad» (feruquimia): the subtitle of a power (§7.6) */
function subtitulo(m: MetalDef, arte: ArteMetal): string {
  if (arte === 'feruquimia') return `${CATEGORIAS_FERUQUIMIA[m.categoriaFeruquimia]} · ${m.rasgoFeruquimico}`
  if (m.interno === null || m.empujon === null) return CATEGORIAS_ALOMANCIA[m.categoriaAlomancia]
  return `${CATEGORIAS_ALOMANCIA[m.categoriaAlomancia]} · ${m.interno ? 'Interno' : 'Externo'} · ${m.empujon ? 'Empujón' : 'Tirón'}`
}

/**
 * Tile of a metal: its official glyph (`MetalGlyph`, T46) on the tint of the metal, in the era of the campaign. The name is the one T28 gave
 * it while the glyphs were provisional; it stays because the components that came after import it (PoderCard, T30; T31, T33). `size` is the
 * nominal size of the icon: the glyph is drawn a quarter bigger, because its artwork leaves a margin inside its square box.
 */
export function GlifoProvisional({ metal, arte, size = 18 }: { metal: MetalDef; arte: ArteMetal; size?: number }) {
  const t = toneFrom(metal.color)
  const caja = Math.round(size * 1.9)
  return (
    <span
      aria-hidden
      style={{
        width: caja, height: caja, flexShrink: 0, borderRadius: radius.sm,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
      }}
    >
      <MetalGlyph metal={metal.id} arte={arte} size={Math.round(size * 1.25)} />
    </span>
  )
}

/** Misting or ferring name of a metal for its art («Lanzamonedas», «Mensajero de acero»); the first one when the book prints two */
const mote = (m: MetalDef, arte: ArteMetal) => (arte === 'alomancia' ? m.nombreBrumoso : m.nombreFerrin).split(' / ')[0]

/** Soft hyphens for the only name too long for a tile of the 4×4 table at 360 px, so it breaks by syllable and not mid-letter */
const SILABAS: Partial<Record<MetalId, string>> = { duraluminio: 'Dura­lu­mi­nio' }

/**
 * One metal of the 4×4 table: a compact toggle tile with the look of FilaOpcion (card surface, the metal's tone once pressed). The
 * pair of a metal is pressed with it. `nota` explains a state in words; a disabled tile does not dim, so its note stays legible.
 */
function Celda({ metal, arte, selected, disabled, nota, onClick }: {
  metal: MetalDef
  arte: ArteMetal
  selected: boolean
  disabled: boolean
  nota?: string
  onClick: () => void
}) {
  const t = toneFrom(metal.color)
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      data-autofocus={selected || undefined}
      onClick={onClick}
      className={disabled ? 'ui-card' : 'ui-card ui-card--interactive'}
      style={{
        ...buttonReset,
        position: 'relative',
        width: '100%',
        minWidth: 0,
        minHeight: 76,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '10px 4px 8px',
        borderRadius: radius.md,
        textAlign: 'center',
        background: selected ? t.bg : disabled ? c.s1 : c.s2,
        border: `1px solid ${selected ? t.border : c.border}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <GlifoProvisional metal={metal} arte={arte} size={16} />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, alignItems: 'center' }}>
        <span style={{ fontSize: fs.xs, fontWeight: 650, lineHeight: 1.2, color: selected ? t.fg : disabled ? c.muted : c.text, overflowWrap: 'break-word' }}>
          {SILABAS[metal.id] ?? metal.nombre}
        </span>
        {/* The misting / ferring name only where there is room (the sheet is a dialog from 640 px) */}
        <span className="hide-mobile" style={{ fontSize: fs.xs, color: c.subtle, lineHeight: 1.25 }}>{mote(metal, arte)}</span>
        {nota && <span style={{ fontSize: fs.xs, color: c.muted, lineHeight: 1.25 }}>{nota}</span>}
      </span>
      {selected && <Check size={14} aria-hidden style={{ position: 'absolute', top: 6, right: 6, color: t.fg }} />}
    </button>
  )
}

/** A chosen power in the summary under the table: what it is and what it does */
function Resumen({ poder, def, chip }: { poder: string; def: PoderDef | undefined; chip?: ReactNode }) {
  const [arte, metalId] = partes(poder)
  const m = getMetal(metalId)
  const pareja = m.pareja ? getMetal(m.pareja).nombre : null
  const forma = m.puro === null ? null : m.puro ? 'Metal puro' : 'Aleación'
  const datos = [subtitulo(m, arte), arte === 'alomancia' ? m.nombreBrumoso : m.nombreFerrin, forma && pareja ? `${forma}, pareja: ${pareja.toLowerCase()}` : forma]
    .filter(Boolean).join(' · ')
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <GlifoProvisional metal={m} arte={arte} size={18} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: fs.base, fontWeight: 650, color: c.text, lineHeight: 1.3 }}>{def?.name ?? `${ARTE[arte].nombre} de ${m.nombre.toLowerCase()}`}</span>
          {chip}
        </span>
        <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.4 }}>{datos}</span>
        {def?.descripcion && <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>{def.descripcion}</span>}
      </div>
    </div>
  )
}

/** Can this origin give this power? §5.3: an alloy of lerasium gives alomancia and a medallion feruchemy (only the metals its table gives players); a spike gives any, but atium */
function permiteOrigen(origen: OrigenConcedido, arte: ArteMetal, metal: MetalId, def: PoderDef): boolean {
  if (metal === 'atium' || !ORIGENES[origen].artes.includes(arte)) return false
  return origen !== 'medallon' || (def.arte === 'feruquimia' && def.medallon.disponibleParaPJ)
}

export function MetalPicker({ open, onClose, arte, modo, era, caminoMetal, yaElegidos, sinHueco = [], nuevaMeta, onConfirm }: MetalPickerProps) {
  const cfg = useWorldConfig()
  const { data, isPending } = useWorldData()
  const resumenId = useId()
  const concedido = modo === 'concedido'
  const nueva = nuevaMeta !== undefined
  const [origen, setOrigen] = useState<OrigenConcedido>('clavo')
  // 'concedido': the arts follow the origin (an alloy of lerasium is alomantic, a medallion feruchemical); otherwise the prop decides
  const artes: ArteMetal[] = concedido ? ORIGENES[origen].artes : arte === 'ambas' ? ['alomancia', 'feruquimia'] : [arte]
  const [vistaElegida, setVista] = useState<ArteMetal>(artes[0])
  const vista = artes.includes(vistaElegida) ? vistaElegida : artes[0]
  const [elegidos, setElegidos] = useState<string[]>([])

  const camino = CAMINOS_NACIDOS_DEL_METAL.find((p) => p.id === caminoMetal)
  // The path receives every power of its art in the era and the choice is only the goal's (nacido de la bruma, feruquimista)
  const todos = modo === 'pareja' || modo === 'puro-aleacion-o-atium'

  const porEra = Object.hasOwn(METALES_POR_CAMINO_Y_ERA, caminoMetal) ? METALES_POR_CAMINO_Y_ERA[caminoMetal as CaminoMetalId] : null
  const enEra = new Set<MetalId>(porEra ? (era ? porEra[era] : [...porEra.era1, ...porEra.era2]) : [])
  const defs = (data?.poderes ?? []).filter((p): p is PoderDef => 'caminos' in p)
  const defDe = (a: ArteMetal, metal: MetalId) => defs.find((d) => d.arte === a && d.metal === metal)
  const ofrecidos = (a: ArteMetal) => METALES.filter((m) => {
    const def = defDe(a, m.id)
    if (!def) return false
    // 'concedido': any metal of the era that the origin allows, whatever the path (the era only filters options, §3 b)
    if (concedido) return (era === null || m.eras.includes(era)) && permiteOrigen(origen, a, m.id, def)
    return enEra.has(m.id) && def.caminos.includes(caminoMetal as CaminoMetalId)
  })
  const poseido = (a: ArteMetal, metal: MetalId) => yaElegidos.includes(id(a, metal)) || (nuevaMeta !== undefined && enEra.has(metal) && !nuevaMeta.includes(id(a, metal)))
  const sinMeta = (a: ArteMetal, metal: MetalId) => defDe(a, metal)?.requiereMeta === false
  const parDe = (a: ArteMetal, m: MetalDef): MetalDef | null => {
    const par = m.pareja ? getMetal(m.pareja) : null
    return par && ofrecidos(a).some((x) => x.id === par.id) && !poseido(a, par.id) && !sinMeta(a, par.id) ? par : null
  }
  const metaDe = (a: ArteMetal) => camino?.metasIniciales.find((m) => m.arte === a)?.titulo

  const elegir = (a: ArteMetal, m: MetalDef) => setElegidos((cur) => {
    if (modo === 'uno-por-arte') return [...cur.filter((x) => !x.startsWith(`${a}:`)), id(a, m.id)].sort((x, y) => (x < y ? -1 : 1))
    if (!todos) return [id(a, m.id)]
    const par = parDe(a, m)
    return (par ? [id(a, m.id), id(a, par.id)] : [id(a, m.id)]).sort((x, y) => ordenMetal(x) - ordenMetal(y))
  })

  // 'concedido': born complete and without a goal; a medallion starts with its 8 charges (§5.1, the director can lower them with PATCH recursos)
  const nuevo = (a: ArteMetal, metal: MetalId): PoderPersonaje => ({
    arte: a, metal, origen: concedido ? origen : 'camino', completo: concedido || sinMeta(a, metal), metaId: null,
    cargas: concedido && origen === 'medallon' ? 8 : 0, ajusteCargasMax: 0, viales: 0, desprovisto: false,
  })
  const recibidos = todos && !nueva ? artes.flatMap((a) => ofrecidos(a).filter((m) => !poseido(a, m.id)).map((m) => nuevo(a, m.id))) : null
  const paraMeta = concedido ? [] : elegidos.filter((p) => !sinMeta(...partes(p)))
  // A spike or an alloy brings the Investida skill of its art: with no free cognitive slot for it, the director frees one first (Q4)
  const faltaHueco = concedido && origen !== 'medallon' && elegidos.some((p) => sinHueco.includes(partes(p)[0]))
  const listo = !!data && !faltaHueco && (modo === 'uno-por-arte' ? artes.every((a) => elegidos.some((p) => p.startsWith(`${a}:`))) : elegidos.length > 0)

  const confirmar = () => onConfirm(nueva ? [] : (recibidos ?? elegidos.map((p) => nuevo(...partes(p)))), paraMeta)

  const disponible = (o: OrigenConcedido) => !ORIGENES[o].solo || era === null || era === ORIGENES[o].solo
  const nombreEra = (e: Era) => cfg.eras?.find((x) => x.id === e)?.label ?? 'otra era'

  const titulo = nueva ? 'Nueva meta de nacido del metal' : concedido ? 'Añadir poder' : modo === 'uno-por-arte' ? 'Poderes alomántico y feruquímico' : todos ? `Poderes ${artes[0] === 'alomancia' ? 'alománticos' : 'feruquímicos'}` : `Poder ${artes[0] === 'alomancia' ? 'alomántico' : 'feruquímico'}`
  const descripcion = nueva
    ? `${modo === 'pareja' ? 'Elige la pareja Empujón/Tirón que entrenará' : 'Elige un metal puro y su aleación, o el atium, para'} la nueva meta «${metaDe(artes[0]) ?? ''}». Solo se ofrecen los poderes nacientes que aún no tienen meta.`
    : concedido
    ? 'El director concede un poder completo y sin meta: un clavo hemalúrgico, una aleación de lerasium o un medallón feruquímico.'
    : modo === 'pareja'
      ? `Obtienes todos los poderes alománticos de tu era en su versión naciente. Elige la pareja Empujón/Tirón que entrenarás primero con la meta «${metaDe('alomancia') ?? 'Entrenar tus poderes'}».`
      : modo === 'puro-aleacion-o-atium'
        ? `Obtienes todos los poderes feruquímicos de tu era en su versión naciente. Elige un metal puro y su aleación, o el atium, para la meta «${metaDe('feruquimia') ?? 'Fabricar tus mentes de metal'}».`
        : modo === 'uno-por-arte'
          ? `Elige un poder alomántico y uno feruquímico, del mismo metal o de metales distintos. Los dos empiezan en su versión naciente y cada uno tiene su meta: «${metaDe('alomancia') ?? 'Entrenar tu poder'}» y «${metaDe('feruquimia') ?? 'Fabricar tu mente de metal'}».`
          : `Elige un ${ARTE[artes[0]].poder} disponible en tu era. Empieza en su versión naciente: la meta «${metaDe(artes[0]) ?? ''}» desbloquea la completa.`

  const enVista = ofrecidos(vista)
  const tabla = enVista.filter((m) => m.id !== 'atium')
  const atium = enVista.find((m) => m.id === 'atium')
  const nombreEn = (p: string) => getMetal(partes(p)[1]).nombre.toLowerCase()

  const estado = (m: MetalDef) => {
    const tiene = poseido(vista, m.id)
    const completa = sinMeta(vista, m.id)
    // A metal of a pair goes alone when its pair is not in the era (gold in Era 1, Q25) or the character already has it
    const solo = todos && !completa && !tiene && m.pareja !== null && !parDe(vista, m)
    const nota = tiene && !(nueva && completa) ? (nueva ? 'Con meta o completo' : 'Ya lo tiene')
      : todos && completa ? 'Completa desde el principio: no necesita meta'
        : !todos && completa ? 'Se usa completa desde el principio: sin meta'
          : solo ? (m.pareja && poseido(vista, m.pareja) ? 'Ya tiene su pareja' : 'Sin pareja en esta era') : undefined
    return { selected: elegidos.includes(id(vista, m.id)), disabled: tiene || (todos && completa), nota }
  }
  const celda = (m: MetalDef) => <Celda key={m.id} metal={m} arte={vista} {...estado(m)} onClick={() => elegir(vista, m)} />
  // Atium goes apart from the 4×4 table (§7.5), as a row of the shared picker look. The note of a disabled row goes outside the
  // button, which dims when disabled (FilaOpcion)
  const filaAtium = (m: MetalDef) => {
    const { selected, disabled, nota } = estado(m)
    const notaId = `${resumenId}-atium`
    return (
      <div>
        <FilaOpcion
          titulo={m.nombre}
          icono={<MetalGlyph metal={m.id} arte={vista} size={28} />}
          t={toneFrom(m.color)}
          selected={selected}
          disabled={disabled}
          describedBy={disabled && nota ? notaId : undefined}
          onClick={() => elegir(vista, m)}
        >
          <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.4 }}>{mote(m, vista)}</span>
          {!disabled && nota && <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.4 }}>{nota}</span>}
        </FilaOpcion>
        {disabled && nota && <p id={notaId} style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.4, margin: '6px 4px 0' }}>{nota}</p>}
      </div>
    )
  }

  // Era chip for a metal of only one era (cromo «Era 2», atium «Era 1»), with the label and tone the world gives each era
  const chipEra = (p: string) => {
    const m = getMetal(partes(p)[1])
    if (m.eras.length !== 1) return undefined
    const e = cfg.eras?.find((x) => x.id === m.eras[0])
    return e ? <span style={{ ...pill(e.tone), fontSize: fs.xs }}>{e.label}</span> : undefined
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={titulo}
      description={descripcion}
      maxWidth={560}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          <Button
            size="lg"
            style={{ flex: 2 }}
            disabled={!listo}
            aria-describedby={faltaHueco ? `${resumenId}-hueco` : undefined}
            onClick={confirmar}
          >
            {concedido ? 'Añadir poder' : nueva ? 'Crear meta' : 'Asignar camino'}
          </Button>
        </>
      }
    >
      {isPending ? (
        <Spinner />
      ) : !data ? (
        // A failed import() stays failed for the rest of the document: only reloading the page recovers it (pattern of T25)
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <ErrorMessage message="No se pudieron cargar los poderes de los metales." />
          <Button onClick={() => window.location.reload()} icon={<RefreshCw size={15} aria-hidden />}>Recargar la página</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {concedido && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={eyebrow}>Origen</p>
              <Segmented<OrigenConcedido>
                ariaLabel="Origen del poder"
                value={origen}
                onChange={(o) => { setOrigen(o); setElegidos([]) }}
                options={ORDEN_ORIGENES.map((o) => ({ value: o, label: ORIGENES[o].corto, ariaLabel: NOMBRE_ORIGEN[o], disabled: !disponible(o) }))}
              />
              <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>{ORIGENES[origen].texto}</p>
              {ORDEN_ORIGENES.flatMap((o) => {
                const solo = ORIGENES[o].solo
                return solo && !disponible(o) ? [
                  <p key={o} style={{ fontSize: fs.sm, color: c.subtle, lineHeight: 1.5 }}>
                    {NOMBRE_ORIGEN[o]}: solo existe en la {nombreEra(solo)}, no en la era de esta campaña.
                  </p>,
                ] : []
              })}
            </div>
          )}

          {artes.length > 1 && (
            <Segmented<ArteMetal>
              ariaLabel="Arte del poder"
              value={vista}
              onChange={setVista}
              options={artes.map((a) => {
                const elegido = elegidos.find((p) => p.startsWith(`${a}:`))
                return { value: a, label: elegido ? `${ARTE[a].nombre}: ${getMetal(partes(elegido)[1]).nombre}` : ARTE[a].nombre }
              })}
            />
          )}

          {enVista.length === 0 ? (
            <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>
              {concedido ? `No hay ${ARTE[vista].poderes} que este origen pueda dar en la era de la campaña.` : `Este camino no tiene ${ARTE[vista].poderes} en la era de la campaña.`}
            </p>
          ) : (
            <div role="group" aria-label={`Metales de ${ARTE[vista].nombre.toLowerCase()}`} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tabla.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>{tabla.map(celda)}</div>}
              {atium && filaAtium(atium)}
            </div>
          )}

          <section
            id={resumenId}
            aria-live="polite"
            aria-label="Selección"
            style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 14px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}
          >
            <p style={eyebrow}>Selección</p>
            {elegidos.length === 0 ? (
              <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>
                {modo === 'pareja' ? 'Elige un metal: su pareja se marca con él.'
                  : modo === 'puro-aleacion-o-atium' ? 'Elige un metal: su pareja se marca con él (el atium va solo).'
                    : modo === 'uno-por-arte' ? 'Elige un metal de cada arte.' : 'Elige un metal de la tabla.'}
              </p>
            ) : (
              elegidos.map((p) => <Resumen key={p} poder={p} def={defDe(...partes(p))} chip={chipEra(p)} />)
            )}
            {elegidos.length > 0 && (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
                {concedido && (
                  <li style={{ fontSize: fs.sm, color: c.text, lineHeight: 1.45 }}>
                    Se añade completo y sin meta ({NOMBRE_ORIGEN[origen].toLowerCase()}){origen === 'medallon' ? ', con 8 cargas' : ''}.
                  </li>
                )}
                {!concedido && artes.map((a) => {
                  const propios = paraMeta.filter((p) => p.startsWith(`${a}:`))
                  const completos = elegidos.filter((p) => p.startsWith(`${a}:`) && sinMeta(a, partes(p)[1]))
                  if (propios.length > 0) return <li key={a} style={{ fontSize: fs.sm, color: c.text, lineHeight: 1.45 }}>Meta «{metaDe(a)}»: {lista(propios.map(nombreEn))}.</li>
                  if (completos.length > 0) return <li key={a} style={{ fontSize: fs.sm, color: c.text, lineHeight: 1.45 }}>Sin meta: la {ARTE[a].nombre.toLowerCase()} de atium se usa completa desde el principio.</li>
                  return null
                })}
                {recibidos && (
                  <li style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45 }}>
                    Poderes que obtiene: {recibidos.length}, nacientes{recibidos.some((p) => p.completo) ? ' (la alomancia de atium, completa)' : ''}.
                  </li>
                )}
              </ul>
            )}
          </section>

          {faltaHueco && (
            <p
              id={`${resumenId}-hueco`}
              role="note"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: radius.sm,
                background: tone.topacio.bg, border: `1px solid ${tone.topacio.border}`, fontSize: fs.sm, color: c.text, lineHeight: 1.5,
              }}
            >
              <TriangleAlert size={17} aria-hidden style={{ color: tone.topacio.fg, flexShrink: 0, marginTop: 1 }} />
              <span>
                No queda ningún hueco libre de habilidad cognitiva para {ARTE[partes(elegidos[0])[0]].nombre}. Libera uno en la pestaña
                Atributos, en modo edición, y vuelve a añadir el poder.
              </span>
            </p>
          )}
        </div>
      )}
    </Sheet>
  )
}
