/**
 * «Equipo inicial» (Nacidos de la bruma, T47; L.254-255 / PDF 260-261): a Sheet that adds one of the seven packages of the book to the
 * bag of a character in a single go. The player picks the package and the weapons it leaves open, rolls its dice (ten times as much in
 * Era 2) and the sheet writes the weapons, armor and gear with one `PUT` of the whole character, the arquillas with `PATCH …/recursos`
 * and, for Fugitivo and Guardador, concludes the initial metalborn goal of the art (the server then marks the power complete, T14).
 *
 * The three writes are independent requests, so they run one after the other and each one remembers that it is done: when one fails the
 * sheet says which, keeps the picks and the roll, and «Reintentar» repeats only what is missing (the objects are never added twice). It
 * starts from a fresh copy of the character, because the `PUT` carries all of it and the arquillas go as an absolute value. The plan
 * itself (what is added, what the benefit does) is `equipoInicialFlujo.ts`.
 * Loaded lazily from components/mistborn/index.ts and importing its data BY FILE, so none of it reaches the main chunk (§8, risk 6).
 */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useQueryClient, type QueryClient, type QueryKey } from '@tanstack/react-query'
import { Anvil, Check, ChevronLeft, ChevronRight, Crown, Dices, Footprints, Hammer, Info, Package, Search, Shield, Sword, Swords, TriangleAlert, VenetianMask, type LucideIcon } from 'lucide-react'
import { Button, ErrorMessage, Field, Select, Sheet } from '../ui'
import { charactersApi } from '../../api/characters'
import { metasApi } from '../../api/metas'
import type { Character, UpdateCharacterRequest } from '../../types'
import { EQUIPO_INICIAL, type PaqueteInicial } from '../../data/mistborn/equipoInicial'
import { getMetal, type ArteMetal, type MetalId } from '../../data/mistborn/metales'
import { rollFree } from '../../utils/dice'
import { formatMoneda } from '../../lib/moneda'
import { useEra, useWorldConfig } from '../../store/campaignStore'
import { buttonReset, c, eyebrow, font, fs, numeral, pill, radius, tone, type Tone } from '../../theme'
import {
  armasDeLaEra,
  bolsaConContenido,
  bolsaConPaquete,
  dineroDelPaquete,
  estadoMeta,
  opcionesDeArma,
  planEquipoInicial,
  sumarArquillas,
  type DineroDelPaquete,
  type EstadoMeta,
} from './equipoInicialFlujo'

export interface EquipoInicialSheetProps {
  open: boolean
  onClose: () => void
  campaignId: number
  /** The character as the Bolsa shows it now (powers, goals and bag); the flow starts again from a fresh copy before it saves */
  character: Character
  /** Weapons of the catalog of the campaign (the Bolsa's own list): the weapon pickers only offer names that exist in it */
  catalogWeapons: readonly { name: string }[]
}

type Fase = 'elegir' | 'detalle' | 'hecho'
/** The three writes, in the order they run */
type Paso = 'equipo' | 'arquillas' | 'meta'

interface ResumenAplicado {
  paquete: string
  armas: string[]
  armaduras: string[]
  objetos: number
  /** Arquillas added and what the purse holds now; `null` = the package gives no money */
  arquillas: { anadidas: number; total: number } | null
  /** What happened to the initial goal of the package's benefit; `null` = the package has no such benefit */
  meta: { concluida: boolean; texto: string } | null
}

const ICONOS: Record<string, LucideIcon> = {
  artesano: Hammer,
  'bajos-fondos': VenetianMask,
  fugitivo: Footprints,
  guardador: Anvil,
  indagador: Search,
  mercenario: Swords,
  noble: Crown,
}

const esperar = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms))

/** The requests of the Arquillas stepper of the Bolsa (same key as its mutation) that are still on their way: ours must land after them */
async function esperarMesa(qc: QueryClient, clave: QueryKey) {
  for (let i = 0; i < 300 && qc.isMutating({ mutationKey: clave }) > 0; i++) await esperar(60)
}

const textoDados = (d: DineroDelPaquete) => `${d.multiplicador > 1 ? `${d.multiplicador} × ` : ''}${d.dados}d${d.caras}`

const lista = (nombres: string[]) => (nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres.join(''))

/** «la alomancia de acero» */
const elPoder = (p: { arte: ArteMetal; metal: string }) => `la ${p.arte} de ${getMetal(p.metal as MetalId).nombre.toLowerCase()}`

/** What the benefit of Fugitivo / Guardador does to this character, as a notice: its tone, its icon and its text */
function avisoDeLaMeta(m: EstadoMeta): { t: Tone; icono: ReactNode; texto: string } {
  const interruptor = 'marca el poder como completo con el interruptor «Meta de nacido del metal completada» de la pestaña «Artes metálicas»'
  switch (m.tipo) {
    case 'concluir':
      return {
        t: tone.esmeralda,
        icono: <Check size={16} />,
        texto: `Al añadirlo se concluirá la meta «${m.titulo ?? 'inicial'}» y ${m.poderes.length > 1 ? 'quedarán completas' : 'quedará completa'} ${lista(m.poderes.map(elPoder))}.`,
      }
    case 'completa':
      return { t: tone.cuarzo, icono: <Info size={16} />, texto: `Tu ${m.arte} ya está completa: no hay ninguna meta que concluir.` }
    case 'sin-camino':
      return { t: tone.topacio, icono: <Info size={16} />, texto: `Todavía no tienes camino de nacido del metal. Cuando lo tengas, ${interruptor}.` }
    case 'camino-sin-arte':
      return { t: tone.topacio, icono: <Info size={16} />, texto: `Tu camino de ${m.camino.toLowerCase()} no concede ${m.arte}: esta ventaja no se aplica a tu personaje.` }
    case 'sin-meta':
      return { t: tone.topacio, icono: <Info size={16} />, texto: `Tu ${m.arte} no tiene una meta de nacido del metal enlazada: ${interruptor}.` }
  }
}

/* ─── Local pieces ─────────────────────────────────────────────────────── */

/** Sub-section of the sheet (h3 under the sheet's h2) */
function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h3 style={{ ...eyebrow, fontFamily: font.ui, marginBottom: 8 }}>{titulo}</h3>
      {children}
    </section>
  )
}

/** One object of the package: its icon in a tinted box and its name */
function FilaObjeto({ t, icono, children }: { t: Tone; icono: ReactNode; children: ReactNode }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, padding: '8px 12px', borderRadius: radius.sm, background: c.s2, border: `1px solid ${c.border}` }}>
      <span aria-hidden style={{ width: 28, height: 28, borderRadius: radius.xs, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg, border: `1px solid ${t.border}`, color: t.fg }}>
        {icono}
      </span>
      <span style={{ flex: 1, minWidth: 0, fontSize: fs.base, fontWeight: 550, color: c.text, overflowWrap: 'anywhere', lineHeight: 1.35 }}>{children}</span>
    </li>
  )
}

function Aviso({ t, icono, children }: { t: Tone; icono: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: radius.sm, background: t.bg, border: `1px solid ${t.border}` }}>
      <span aria-hidden style={{ display: 'flex', color: t.fg, marginTop: 2, flexShrink: 0 }}>{icono}</span>
      <p style={{ fontSize: fs.sm, color: c.text, lineHeight: 1.5 }}>{children}</p>
    </div>
  )
}

const listaVertical = { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 } as const

/* ─── Sheet ────────────────────────────────────────────────────────────── */

export function EquipoInicialSheet({ open, onClose, campaignId, character, catalogWeapons }: EquipoInicialSheetProps) {
  const cfg = useWorldConfig()
  const era = useEra()
  const qc = useQueryClient()

  const [paqueteId, setPaqueteId] = useState<string | null>(null)
  // Per package, so that going back to the list and returning to the same one neither loses the picks nor allows another roll
  const [elecciones, setElecciones] = useState<Record<string, string[]>>({})
  const [tiradas, setTiradas] = useState<Record<string, number[]>>({})
  const [estado, setEstado] = useState<'libre' | 'aplicando' | 'error' | 'hecho'>('libre')
  const [error, setError] = useState<string | null>(null)
  const [resumen, setResumen] = useState<ResumenAplicado | null>(null)
  // Some write already went through: the picks and the roll are final and the package cannot be changed (it would add the first one twice)
  const [parcial, setParcial] = useState(false)
  // The package the player came back from, so that the focus returns to its row
  const [ultimo, setUltimo] = useState<string | null>(null)
  // Writes already done, and what they produced, so that «Reintentar» runs only the missing ones (read and written from the handler only)
  const hechos = useRef(new Set<Paso>())
  const producido = useRef<{ arquillas: ResumenAplicado['arquillas']; meta: string | null }>({ arquillas: null, meta: null })
  const contenido = useRef<HTMLDivElement>(null)
  // A second tap on «Añadir a la bolsa» before the first one has rendered must not start the writes twice (the state alone would not stop it)
  const enCurso = useRef(false)
  const faltaId = useId()

  const paquete = EQUIPO_INICIAL.find((p) => p.id === paqueteId) ?? null
  const fase: Fase = estado === 'hecho' ? 'hecho' : paquete ? 'detalle' : 'elegir'
  const aplicando = estado === 'aplicando'
  const bloqueado = aplicando || parcial

  // The Bolsa may hold a copy of the character up to 30 s old: read it again on opening, so that what the sheet says about the bag, the powers and
  // the goals is current (the writes start from a fresh read anyway)
  useEffect(() => {
    void qc.invalidateQueries({ queryKey: ['character', campaignId, character.id] })
  }, [qc, campaignId, character.id])

  // A step change removes the control that had the focus: move it to the first control of the new step («Otro paquete», the summary)
  useEffect(() => {
    contenido.current?.querySelector<HTMLElement>('[data-foco]')?.focus()
  }, [fase])

  const cerrar = () => { if (!aplicando) onClose() }
  const elegirPaquete = (id: string) => { setPaqueteId(id); setError(null); setEstado('libre') }
  const volver = () => { setUltimo(paqueteId); setPaqueteId(null); setError(null); setEstado('libre') }

  const filas = paquete ? armasDeLaEra(paquete, era) : []
  const elegidas = (paquete && elecciones[paquete.id]) || []
  const tirada = (paquete && tiradas[paquete.id]) || null
  const dinero = paquete ? dineroDelPaquete(paquete, era) : null
  const plan = paquete ? planEquipoInicial({ paquete, era, elecciones: elegidas, tirada, personaje: character }) : null
  const hayFalta = !!plan && plan.pendiente.length > 0 && !error

  const elegirArma = (indice: number, nombre: string) => {
    if (!paquete) return
    setElecciones((todas) => {
      const actuales = [...(todas[paquete.id] ?? [])]
      actuales[indice] = nombre
      return { ...todas, [paquete.id]: actuales }
    })
  }

  const tirar = () => {
    if (!paquete || !dinero || tirada) return
    setTiradas((todas) => ({ ...todas, [paquete.id]: rollFree(dinero.dados, dinero.caras).results }))
    // The roll button is replaced by its result: the focus goes to the result, once it is on screen, instead of falling to the page
    window.setTimeout(() => contenido.current?.querySelector<HTMLElement>('[data-tirada]')?.focus(), 0)
  }

  /** The three writes, one after the other; each remembers it is done and only the missing ones run again on «Reintentar» */
  async function aplicar(p: PaqueteInicial) {
    if (!plan || plan.pendiente.length > 0 || enCurso.current) return
    enCurso.current = true
    setEstado('aplicando')
    setError(null)
    const prefijo = ['character', campaignId, character.id]
    // The step a failure is blamed on: the first one still pending (a retry whose first request fails must not say that nothing was added)
    let paso: Paso = !hechos.current.has('equipo') ? 'equipo' : plan.arquillas > 0 && !hechos.current.has('arquillas') ? 'arquillas' : 'meta'
    try {
      // Fresh base: the PUT carries the whole character and the arquillas go as an absolute value, so it must not start from a copy up to 30 s old
      const base = await qc.fetchQuery({ queryKey: prefijo, queryFn: () => charactersApi.getById(campaignId, character.id), staleTime: 0 })

      if (!hechos.current.has('equipo')) {
        await charactersApi.update(campaignId, character.id, { ...(base as UpdateCharacterRequest), ...bolsaConPaquete(base, plan) })
        hechos.current.add('equipo')
        setParcial(true)
      }

      if (plan.arquillas > 0 && !hechos.current.has('arquillas')) {
        paso = 'arquillas'
        await esperarMesa(qc, ['mesa', campaignId, character.id])
        const vivo = qc.getQueryData<Character>(prefijo)?.recursos?.arquillas ?? base.recursos?.arquillas ?? 0
        const total = sumarArquillas(vivo, plan.arquillas)
        await charactersApi.patchRecursos(campaignId, character.id, { recursos: { arquillas: total } })
        hechos.current.add('arquillas')
        producido.current.arquillas = { anadidas: plan.arquillas, total }
      }

      let meta: ResumenAplicado['meta'] = null
      if (plan.meta) {
        paso = 'meta'
        // What the goal is NOW, not when the sheet was opened
        const ahora = estadoMeta(plan.meta.arte, qc.getQueryData<Character>(prefijo) ?? base)
        if (ahora.tipo === 'concluir' && !hechos.current.has('meta')) {
          await metasApi.conclude(campaignId, character.id, ahora.metaId, { tipoConclusion: 'exito', notasConclusion: 'Equipo inicial' })
          hechos.current.add('meta')
          producido.current.meta = `Meta «${ahora.titulo ?? 'inicial'}» concluida: ${lista(ahora.poderes.map(elPoder))} ${ahora.poderes.length > 1 ? 'ya están completas' : 'ya está completa'}.`
        }
        meta = producido.current.meta ? { concluida: true, texto: producido.current.meta } : { concluida: false, texto: avisoDeLaMeta(ahora).texto }
      }

      setResumen({ paquete: p.nombre, armas: plan.armas, armaduras: plan.armaduras, objetos: plan.equipo.length, arquillas: producido.current.arquillas, meta })
      setEstado('hecho')
    } catch {
      setError(
        paso === 'equipo'
          ? 'No se ha podido guardar el equipo en la bolsa. No se ha añadido nada: inténtalo de nuevo.'
          : paso === 'arquillas'
            ? `El equipo ya está en la bolsa, pero no se han podido guardar las arquillas (${formatMoneda(plan.arquillas, cfg.moneda)}). Reintenta: solo se repetirá este paso.`
            : 'El equipo ya está en la bolsa, pero no se ha podido concluir la meta. Reintenta, o marca el poder como completo con el interruptor de la pestaña «Artes metálicas».',
      )
      setEstado('error')
    } finally {
      enCurso.current = false
      // Whatever got done shows in the Bolsa, the hub and the goals even when a later step failed
      void qc.invalidateQueries({ queryKey: prefijo })
      void qc.invalidateQueries({ queryKey: ['characters', campaignId] })
      void qc.invalidateQueries({ queryKey: ['metas', campaignId, character.id] })
    }
  }

  /* ─── Views ─── */

  const vistaElegir = (
    <ul style={listaVertical}>
      {EQUIPO_INICIAL.map((p) => {
        const Icono = ICONOS[p.id] ?? Package
        const d = dineroDelPaquete(p, era)
        return (
          <li key={p.id}>
            <button
              type="button"
              className="ui-card ui-card--interactive"
              onClick={() => elegirPaquete(p.id)}
              data-foco={p.id === (ultimo ?? EQUIPO_INICIAL[0].id) ? '' : undefined}
              style={{ ...buttonReset, width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, minHeight: 56, padding: '12px 14px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}
            >
              <span aria-hidden style={{ width: 40, height: 40, flexShrink: 0, borderRadius: radius.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tone.brand.bg, border: `1px solid ${tone.brand.border}`, color: tone.brand.fg }}>
                <Icono size={20} />
              </span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: fs.base, fontWeight: 600, lineHeight: 1.3, color: c.text }}>{p.nombre}</span>
                <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45 }}>{p.resumen}</span>
                <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {d ? <span style={pill(tone.esmeralda)}>{textoDados(d)} {cfg.moneda.simbolo}</span> : <span style={pill(tone.cuarzo)}>Sin dinero</span>}
                  {p.beneficios.map((b) => <span key={b.titulo} style={pill(tone.amatista)}>{b.titulo}</span>)}
                </span>
              </span>
              <ChevronRight size={18} aria-hidden style={{ color: c.subtle, flexShrink: 0, marginTop: 11 }} />
            </button>
          </li>
        )
      })}
    </ul>
  )

  const vistaDetalle = paquete && plan && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Button variant="ghost" icon={<ChevronLeft size={16} aria-hidden />} onClick={volver} disabled={bloqueado} data-foco style={{ alignSelf: 'flex-start' }}>
        Otro paquete
      </Button>
      <p style={{ fontSize: fs.sm + 1, color: c.muted, lineHeight: 1.5 }}>{paquete.resumen}</p>

      {!parcial && bolsaConContenido(character) && (
        <Aviso t={tone.topacio} icono={<TriangleAlert size={16} />}>
          Esta bolsa ya tiene objetos o arquillas: el paquete se añade a lo que hay. El libro da un único equipo inicial al crear el personaje.
        </Aviso>
      )}

      {filas.length > 0 && (
        <Seccion titulo="Armas">
          <ul style={listaVertical}>
            {filas.map((fila, i) => {
              if (fila.tipo === 'fijo') return <FilaObjeto key={i} t={tone.rubi} icono={<Sword size={15} />}>{fila.nombre}</FilaObjeto>
              const opciones = opcionesDeArma(fila, era, catalogWeapons)
              return (
                <li key={i}>
                  <Field label={fila.etiqueta}>
                    <Select value={elegidas[i] ?? ''} onChange={(e) => elegirArma(i, e.target.value)} disabled={bloqueado || opciones.length === 0}>
                      <option value="">{opciones.length > 0 ? 'Elige un arma…' : catalogWeapons.length === 0 ? 'Cargando el catálogo…' : 'El catálogo de la campaña no tiene armas de esta categoría'}</option>
                      {opciones.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
                    </Select>
                  </Field>
                </li>
              )
            })}
          </ul>
        </Seccion>
      )}

      {paquete.armaduras.length > 0 && (
        <Seccion titulo={paquete.armaduras.length > 1 ? 'Armaduras' : 'Armadura'}>
          <ul style={listaVertical}>
            {paquete.armaduras.map((nombre) => <FilaObjeto key={nombre} t={tone.circon} icono={<Shield size={15} />}>{nombre}</FilaObjeto>)}
          </ul>
        </Seccion>
      )}

      <Seccion titulo="Equipo">
        <ul style={listaVertical}>
          {paquete.equipo.map((o) => (
            <FilaObjeto key={o.nombre} t={tone.amatista} icono={<Package size={15} />}>
              {o.cantidad > 1 && <><span style={{ ...numeral, fontSize: fs.base, color: c.muted, marginRight: 2 }}>{o.cantidad} ×</span>{' '}</>}
              {o.nombre}
            </FilaObjeto>
          ))}
        </ul>
      </Seccion>

      {dinero && (
        <Seccion titulo="Dinero">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}>
            <p style={{ fontSize: fs.base, color: c.text }}>
              {textoDados(dinero)} {cfg.moneda.nombre.toLowerCase()}
              {dinero.multiplicador > 1 && <span style={{ color: c.muted }}> (Era 2: diez veces lo que sale en los dados)</span>}
            </p>
            {tirada ? (
              <div
                role="group"
                tabIndex={-1}
                data-tirada
                aria-label={`Tirada de ${dinero.dados}d${dinero.caras}: ${lista(tirada.map(String))}. Total ${tirada.reduce((suma, d) => suma + d, 0)}${dinero.multiplicador > 1 ? `, por ${dinero.multiplicador}` : ''}: ${formatMoneda(plan.arquillas, cfg.moneda)}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
              >
                {tirada.map((d, i) => (
                  <span key={i} style={{ fontFamily: font.mono, fontSize: fs.base, fontWeight: 700, minWidth: 32, textAlign: 'center', padding: '4px 8px', borderRadius: radius.sm, background: c.s1, border: `1px solid ${c.borderBright}`, color: c.text }}>{d}</span>
                ))}
                <span style={{ fontSize: fs.base, color: c.text }}>
                  = <strong style={numeral}>{tirada.reduce((suma, d) => suma + d, 0)}</strong>
                  {dinero.multiplicador > 1 && <> × {dinero.multiplicador}</>}
                  {' → '}
                  <strong style={{ ...numeral, color: tone.esmeralda.fg }}>{formatMoneda(plan.arquillas, cfg.moneda)}</strong>
                </span>
              </div>
            ) : (
              <Button variant="secondary" icon={<Dices size={16} aria-hidden />} onClick={tirar} disabled={bloqueado} style={{ alignSelf: 'flex-start' }}>
                Tirar {dinero.dados}d{dinero.caras}
              </Button>
            )}
          </div>
        </Seccion>
      )}

      {paquete.beneficios.length > 0 && (
        <Seccion titulo={paquete.beneficios.length > 1 ? 'Beneficios' : 'Beneficio'}>
          <ul style={listaVertical}>
            {paquete.beneficios.map((b) => {
              const aviso = b.completaMeta && plan.meta ? avisoDeLaMeta(plan.meta) : null
              return (
                <li key={b.titulo} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}>
                  <p style={{ fontSize: fs.base, fontWeight: 600, color: c.text }}>{b.titulo}</p>
                  <p style={{ fontSize: fs.sm + 1, color: c.muted, lineHeight: 1.5 }}>{b.texto}</p>
                  {aviso && <Aviso t={aviso.t} icono={aviso.icono}>{aviso.texto}</Aviso>}
                </li>
              )
            })}
          </ul>
        </Seccion>
      )}

      {paquete.notaLibro && <p style={{ fontSize: fs.sm, color: c.subtle, lineHeight: 1.5 }}>{paquete.notaLibro}</p>}

      {hayFalta && <p id={faltaId} style={{ fontSize: fs.sm, color: c.muted }}>Falta {lista(plan.pendiente)}.</p>}
      {error && <ErrorMessage message={error} />}
    </div>
  )

  const vistaHecho = resumen && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 data-foco tabIndex={-1} style={{ fontSize: fs.lg, fontWeight: 650, color: c.text, lineHeight: 1.3 }}>
        Añadido a la bolsa de {character.name}
      </h3>
      <ul style={listaVertical}>
        {resumen.armas.length > 0 && <FilaObjeto t={tone.rubi} icono={<Sword size={15} />}>{lista(resumen.armas)}</FilaObjeto>}
        {resumen.armaduras.length > 0 && <FilaObjeto t={tone.circon} icono={<Shield size={15} />}>{lista(resumen.armaduras)}</FilaObjeto>}
        <FilaObjeto t={tone.amatista} icono={<Package size={15} />}>{resumen.objetos} {resumen.objetos === 1 ? 'objeto de equipo' : 'objetos de equipo'}</FilaObjeto>
        {resumen.arquillas && (
          <FilaObjeto t={tone.esmeralda} icono={<Check size={15} />}>
            +{formatMoneda(resumen.arquillas.anadidas, cfg.moneda)}: ahora tienes {formatMoneda(resumen.arquillas.total, cfg.moneda, { fija: true })}
          </FilaObjeto>
        )}
        {resumen.meta && (
          <FilaObjeto t={resumen.meta.concluida ? tone.esmeralda : tone.topacio} icono={resumen.meta.concluida ? <Check size={15} /> : <Info size={15} />}>
            {resumen.meta.texto}
          </FilaObjeto>
        )}
      </ul>
    </div>
  )

  const titulo = fase === 'hecho' && resumen ? `Equipo inicial de ${resumen.paquete}` : paquete ? `Equipo inicial de ${paquete.nombre}` : 'Equipo inicial'
  const descripcion = fase === 'elegir'
    ? `Elige uno de los siete paquetes del libro (paso 6 de la creación del personaje). Se añade a la bolsa de ${character.name}.`
    : undefined

  return (
    <Sheet
      open={open}
      onClose={cerrar}
      title={titulo}
      description={descripcion}
      maxWidth={560}
      footer={
        fase === 'detalle' ? (
          <>
            <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={cerrar} disabled={aplicando}>{parcial ? 'Cerrar' : 'Cancelar'}</Button>
            <Button
              size="lg"
              style={{ flex: 2 }}
              disabled={!plan || plan.pendiente.length > 0}
              aria-describedby={hayFalta ? faltaId : undefined}
              loading={aplicando}
              onClick={() => { if (paquete) void aplicar(paquete) }}
            >
              {estado === 'error' ? 'Reintentar' : 'Añadir a la bolsa'}
            </Button>
          </>
        ) : (
          <Button variant="secondary" size="lg" fullWidth onClick={cerrar}>Cerrar</Button>
        )
      }
    >
      <div ref={contenido}>{fase === 'hecho' ? vistaHecho : fase === 'detalle' ? vistaDetalle : vistaElegir}</div>
    </Sheet>
  )
}
