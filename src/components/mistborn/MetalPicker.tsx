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
 * A metal whose pair is not offered (gold in Era 1, whose alloy electro is not in the table) is chosen alone (Q25). Alomancia de
 * atium is complete from the start and trains no goal (L.177 / PDF 183; L.135 / PDF 141).
 *
 * It only chooses: `onConfirm(poderes, paraMeta)` hands back the powers to create and the ids (`${arte}:${metal}`) the goal trains;
 * the sheet saves them (CharacterDetailPage, `aplicarCaminoMetal`). The powers data come from `useWorldData()` (lazy, §8 risk 6);
 * the picker itself is loaded lazily from components/mistborn/index.ts (§7.4 rule 4).
 */
import { useId, useState, type ReactNode } from 'react'
import { Anvil, Check, Flame, RefreshCw } from 'lucide-react'
import { Button, ErrorMessage, Segmented, Sheet, Spinner } from '../ui'
import type { Era, PoderPersonaje } from '../../types'
import type { PoderDef } from '../../data/mistborn/tipos'
import {
  CATEGORIAS_ALOMANCIA, CATEGORIAS_FERUQUIMIA, METALES, METALES_POR_CAMINO_Y_ERA, getMetal,
  type ArteMetal, type CaminoMetalId, type MetalDef, type MetalId,
} from '../../data/mistborn/metales'
import { CAMINOS_NACIDOS_DEL_METAL, type SeleccionMeta } from '../../data/mistborn/caminosNacidosDelMetal'
import { useWorldConfig, useWorldData } from '../../store/campaignStore'
import { buttonReset, c, eyebrow, fs, pill, radius, toneFrom } from '../../theme'
import { FilaOpcion } from './FilaOpcion'

export interface MetalPickerProps {
  open: boolean
  onClose: () => void
  /** Art whose metals are offered; 'ambas' = one power of each art (nacidoble) */
  arte: ArteMetal | 'ambas'
  /** How the first goal picks its powers (`CaminoNacidoDelMetal.seleccionMeta`) */
  modo: SeleccionMeta
  /** Era of the campaign (`null` = every era) */
  era: Era | null
  /** Metalborn path the powers come from: with the era it decides which metals exist */
  caminoMetal: string
  /** Power ids (`${arte}:${metal}`) the character keeps from another origin: shown, never offered again */
  yaElegidos: string[]
  onConfirm: (poderes: PoderPersonaje[], paraMeta: string[]) => void
}

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

/** Provisional glyph of a metal: the Lucide icon of the art on the metal's tint. T46 replaces it with `MetalGlyph` (official glyphs, §7.8) */
function GlifoProvisional({ metal, arte, size = 18 }: { metal: MetalDef; arte: ArteMetal; size?: number }) {
  const t = toneFrom(metal.color)
  const Icono = arte === 'alomancia' ? Flame : Anvil
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
      <Icono size={size} />
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

export function MetalPicker({ open, onClose, arte, modo, era, caminoMetal, yaElegidos, onConfirm }: MetalPickerProps) {
  const cfg = useWorldConfig()
  const { data, isPending } = useWorldData()
  const resumenId = useId()
  const artes: ArteMetal[] = arte === 'ambas' ? ['alomancia', 'feruquimia'] : [arte]
  const [vista, setVista] = useState<ArteMetal>(artes[0])
  const [elegidos, setElegidos] = useState<string[]>([])

  const camino = CAMINOS_NACIDOS_DEL_METAL.find((p) => p.id === caminoMetal)
  // The path receives every power of its art in the era and the choice is only the goal's (nacido de la bruma, feruquimista)
  const todos = modo === 'pareja' || modo === 'puro-aleacion-o-atium'

  const porEra = Object.hasOwn(METALES_POR_CAMINO_Y_ERA, caminoMetal) ? METALES_POR_CAMINO_Y_ERA[caminoMetal as CaminoMetalId] : null
  const enEra = new Set<MetalId>(porEra ? (era ? porEra[era] : [...porEra.era1, ...porEra.era2]) : [])
  const defs = (data?.poderes ?? []).filter((p): p is PoderDef => 'caminos' in p)
  const defDe = (a: ArteMetal, metal: MetalId) => defs.find((d) => d.arte === a && d.metal === metal)
  const ofrecidos = (a: ArteMetal) => METALES.filter((m) => enEra.has(m.id) && !!defDe(a, m.id)?.caminos.includes(caminoMetal as CaminoMetalId))
  const poseido = (a: ArteMetal, metal: MetalId) => yaElegidos.includes(id(a, metal))
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

  const nuevo = (a: ArteMetal, metal: MetalId): PoderPersonaje => ({
    arte: a, metal, origen: 'camino', completo: sinMeta(a, metal), metaId: null, cargas: 0, ajusteCargasMax: 0, viales: 0, desprovisto: false,
  })
  const recibidos = todos ? artes.flatMap((a) => ofrecidos(a).filter((m) => !poseido(a, m.id)).map((m) => nuevo(a, m.id))) : null
  const paraMeta = elegidos.filter((p) => !sinMeta(...partes(p)))
  const listo = !!data && (modo === 'uno-por-arte' ? artes.every((a) => elegidos.some((p) => p.startsWith(`${a}:`))) : elegidos.length > 0)

  const confirmar = () => onConfirm(recibidos ?? elegidos.map((p) => nuevo(...partes(p))), paraMeta)

  const titulo = modo === 'uno-por-arte' ? 'Poderes alomántico y feruquímico' : todos ? `Poderes ${artes[0] === 'alomancia' ? 'alománticos' : 'feruquímicos'}` : `Poder ${artes[0] === 'alomancia' ? 'alomántico' : 'feruquímico'}`
  const descripcion = modo === 'pareja'
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
    const nota = tiene ? 'Ya lo tiene'
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
    const Icono = vista === 'alomancia' ? Flame : Anvil
    const notaId = `${resumenId}-atium`
    return (
      <div>
        <FilaOpcion
          titulo={m.nombre}
          icono={<Icono size={20} />}
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
          <Button size="lg" style={{ flex: 2 }} disabled={!listo} onClick={confirmar}>Asignar camino</Button>
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
          {arte === 'ambas' && (
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
            <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>Este camino no tiene {ARTE[vista].poderes} en la era de la campaña.</p>
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
                {artes.map((a) => {
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
        </div>
      )}
    </Sheet>
  )
}
