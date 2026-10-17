/**
 * «Pasar semanas» (director): choose how many weeks pass, read what will happen, confirm, and read what happened. Only the director runs
 * it, so it shows everything, to comment it with the players: the preview is exactly what is applied plus each black market lot's
 * chances (its sales are rolled when confirming, and are not counted in the treasury until then); the result shows each roll.
 * With «Tirar» sucesos, the weeks are rolled one by one («Cosas que pueden pasar», sucesos.ts): at each event the sheet stops for the
 * director to play it (the weeks pass up to it and the rest wait) or skip it (they go on). An event that damages proposes the upgrades
 * (at random) and the director validates which: only a played event applies it. Closing the sheet before the end applies nothing.
 */
import { useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, ArrowRight, Lock } from 'lucide-react'
import { Badge, Button, ErrorMessage, Field, Segmented, Select, Sheet, Stepper, Switch } from '../../components/ui'
import { isAvailable } from '../../worlds'
import { textoEra, type CatalogoBanda, type TablaSucesosDef } from '../../lib/banda/tipos'
import type { Era } from '../../types'
import { c, font, fs, numeral, radius, tone } from '../../theme'
import {
  pasarSemanas, simularSemanas, type LineaImporte, type ResumenSemanas, type SucesosDeLaPasada, type TiradasMercado,
} from './economia'
import { tirarD100 } from './mercadoNegro'
import {
  efectosDanos, mejorasDanables, probabilidadSuceso, proponerDanos, tirarHastaSuceso, umbralSuceso, type MejoraDanable, type SemanaSucesos,
} from './sucesos'
import type { DecisionSuceso } from './estado'
import type { CtxBanda, DocBanda, OpBanda } from './operaciones'
import { conSigno, textoSuave, tonoProbabilidad, useEjecutar } from './etiquetas'

const titulo = { fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, color: c.text } as const

type ModoSucesos = 'tirar' | 'sin'

/**
 * The weeks being rolled: the black market's dice (rolled once) and the events so far, the last one waiting for the director with the
 * upgrades he would damage (`refugio|mejora`, proposed at random when it came up)
 */
interface Pasada {
  tiradas: TiradasMercado
  semanas: SemanaSucesos[]
  sinSuceso: number
  danos: string[]
}

/** What was applied, for the last step */
interface Resultado {
  resumen: ResumenSemanas
  /** The weeks rolled for events; null = they passed without rolling */
  sucesos: SemanaSucesos[] | null
  /** Weeks the director wanted to pass */
  deSemanas: number
  /** Quiet weeks in a row after this time (the internal value) */
  sinSuceso: number
}

export function SemanasSheet({ onClose, doc, catalogo, era, crearCtx, dinero, aplicar }: {
  onClose: () => void
  doc: DocBanda
  catalogo: CatalogoBanda
  era: Era | null
  crearCtx: () => CtxBanda
  dinero: (v: number) => string
  aplicar: (op: OpBanda) => void
}) {
  const contextos = catalogo.contextos.filter((x) => isAvailable(x, era))
  const tabla = catalogo.sucesos
  const [semanas, setSemanas] = useState(1)
  // It starts from the scarcity chosen last time, while it fits the era
  const [contexto, setContexto] = useState<string | null>(contextos.find((x) => x.id === doc.banda.escasez)?.id ?? contextos[0]?.id ?? null)
  const [modo, setModo] = useState<ModoSucesos>(tabla ? 'tirar' : 'sin')
  const [pasada, setPasada] = useState<Pasada | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const { error, ejecutar } = useEjecutar(aplicar)
  const previa = useMemo(() => simularSemanas(doc, crearCtx(), semanas, contexto).resumen, [doc, crearCtx, semanas, contexto])
  const resumen = resultado?.resumen ?? previa

  /** Applies `n` weeks with the black market's dice and, when rolled, the events; then shows what happened */
  const terminar = (n: number, tiradas: TiradasMercado, sucesos?: SucesosDeLaPasada) => {
    const final = simularSemanas(doc, crearCtx(), n, contexto, tiradas).resumen
    ejecutar(pasarSemanas(n, contexto, tiradas, sucesos), () => {
      setResultado({
        resumen: final, sucesos: sucesos?.semanas ?? null, deSemanas: semanas, sinSuceso: sucesos?.sinSuceso ?? doc.secretos.semanasSinSuceso,
      })
      setPasada(null)
    })
  }

  /** Rolls the events from week `desde`: it stops at the next one, or passes every week when none comes */
  const seguir = (p: Pasada, desde: number, t: TablaSucesosDef) => {
    const r = tirarHastaSuceso(t, desde, semanas, p.sinSuceso)
    const efecto = r.parada ? r.semanas[r.semanas.length - 1].suceso?.def?.efecto : undefined
    const danos = efecto ? proponerDanos(mejorasDanables(doc, catalogo), efecto) : []
    const siguiente: Pasada = { ...p, semanas: [...p.semanas, ...r.semanas], sinSuceso: r.sinSuceso, danos }
    if (r.parada) setPasada(siguiente)
    else terminar(semanas, p.tiradas, { semanas: siguiente.semanas, sinSuceso: siguiente.sinSuceso, deSemanas: semanas })
  }

  const confirmar = () => {
    // The dice are rolled here, once: the operation carries them, so applying it again after a 409 gives the same result
    const tiradas: TiradasMercado = Object.fromEntries(
      doc.banda.almacen.filter((m) => m.situacion === 'en-venta').map((m) => [m.id, tirarD100(semanas)]),
    )
    if (!tabla || modo === 'sin') terminar(semanas, tiradas)
    else seguir({ tiradas, semanas: [], sinSuceso: doc.secretos.semanasSinSuceso, danos: [] }, 1, tabla)
  }

  /** The director plays the event (the weeks stop there, and its damage applies to the upgrades he left marked) or skips it (they go on) */
  const decidir = (decision: DecisionSuceso) => {
    if (!pasada || !tabla) return
    const ultima = pasada.semanas[pasada.semanas.length - 1]
    const conDanos = decision === 'jugado' && !!ultima.suceso?.def?.efecto && pasada.danos.length > 0
    const danables = conDanos ? mejorasDanables(doc, catalogo) : []
    const elegidas = danables.filter((d) => pasada.danos.includes(d.clave))
    const marcadas = pasada.semanas.map((s) => (s === ultima && s.suceso
      ? {
        ...s,
        suceso: {
          ...s.suceso, decision,
          ...(conDanos ? { danos: elegidas.map((d) => ({ refugio: d.refugioId, mejora: d.mejoraId })), efectos: efectosDanos(danables, pasada.danos) } : {}),
        },
      }
      : s))
    const p: Pasada = { ...pasada, semanas: marcadas }
    if (decision === 'jugado' || ultima.semana >= semanas) {
      terminar(decision === 'jugado' ? ultima.semana : semanas, p.tiradas, { semanas: marcadas, sinSuceso: p.sinSuceso, deSemanas: semanas })
    } else {
      seguir(p, ultima.semana + 1, tabla)
    }
  }

  const total = (l: LineaImporte[]) => l.reduce((s, x) => s + x.importe, 0)
  const diferencia = resumen.tesoreriaDespues - resumen.tesoreriaAntes
  const n = resumen.semanas
  const pendiente = pasada && tabla ? pasada.semanas[pasada.semanas.length - 1] : null
  const umbralAhora = tabla ? umbralSuceso(tabla, doc.secretos.semanasSinSuceso) : 0

  return (
    <Sheet
      open
      onClose={onClose}
      title={resultado
        ? (n === 1 ? 'Ha pasado 1 semana' : `Han pasado ${n} semanas`)
        : pendiente ? `Semana ${pendiente.semana} de ${semanas}: pasa algo` : 'Pasar semanas'}
      description={resultado
        ? 'Esto es lo que ha pasado: ya está en la hoja y en el registro.'
        : pendiente
          ? 'Solo lo ves tú. Si cierras ahora, no pasa ninguna semana.'
          : 'Revisa lo que pasará antes de confirmarlo: sueldos, mantenimiento, beneficios, obras, lealtad y mercado negro.'}
      maxWidth={600}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 8 }}>
          {resultado ? (
            <Button onClick={onClose}>Cerrar</Button>
          ) : pendiente ? (
            <>
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button variant="secondary" onClick={() => decidir('omitido')}>{pendiente.semana < semanas ? 'Omitir y seguir' : 'Omitir y terminar'}</Button>
              <Button onClick={() => decidir('jugado')}>Parar y jugar el suceso</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button onClick={confirmar}>Pasar {semanas} {semanas === 1 ? 'semana' : 'semanas'}</Button>
            </>
          )}
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 16 }}>
        {pasada && tabla && pendiente ? (
          <PasoSuceso
            pasada={pasada}
            semanas={semanas}
            tabla={tabla}
            era={era}
            danables={mejorasDanables(doc, catalogo)}
            onDano={(clave, si) => setPasada({ ...pasada, danos: si ? [...pasada.danos.filter((x) => x !== clave), clave] : pasada.danos.filter((x) => x !== clave) })}
          />
        ) : (
          <>
            {!resultado && (
              <div style={{ display: 'grid', gridTemplateColumns: contextos.length ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr', gap: 12, alignItems: 'end' }}>
                <div>
                  <p style={{ fontSize: fs.sm, fontWeight: 650, color: c.text, marginBottom: 6 }}>Semanas</p>
                  <Stepper label="Semanas que pasan" value={semanas} onChange={setSemanas} min={1} max={52} />
                </div>
                {contextos.length > 0 && (
                  <Field label="Escasez">
                    <Select value={contexto ?? ''} onChange={(e) => setContexto(e.target.value || null)}>
                      {contextos.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                    </Select>
                  </Field>
                )}
              </div>
            )}

            {!resultado && tabla && (
              <div style={{ display: 'grid', gap: 6 }}>
                <p style={{ fontSize: fs.sm, fontWeight: 650, color: c.text }}>Sucesos</p>
                <Segmented<ModoSucesos>
                  ariaLabel="Sucesos"
                  value={modo}
                  onChange={setModo}
                  options={[{ value: 'tirar', label: 'Tirar' }, { value: 'sin', label: 'Sin sucesos' }]}
                />
                <p style={{ ...textoSuave, fontSize: fs.xs }}>
                  {modo === 'tirar'
                    ? `Cada semana se tira 1d${tabla.dado}: ahora pasa algo con un ${umbralAhora} o más (${probabilidadSuceso(tabla, umbralAhora)} %), y cada semana tranquila lo hace más probable. Si pasa algo, se para para que decidas.`
                    : 'Las semanas pasan sin tirar sucesos, y la probabilidad acumulada se queda como está.'}
                </p>
              </div>
            )}

            {resultado && <SucesosResultado resultado={resultado} tabla={tabla} />}

            {/* The result first: the treasury before and after */}
            <div style={{ padding: 14, borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ ...numeral, fontSize: fs.xl, color: c.text }}>{dinero(resumen.tesoreriaAntes)}</span>
              <ArrowRight size={18} aria-hidden style={{ color: c.subtle }} />
              <span style={{ ...numeral, fontSize: fs.xl, color: c.text }}>{dinero(resumen.tesoreriaDespues)}</span>
              <Badge tone={diferencia >= 0 ? 'esmeralda' : 'rubi'}>{diferencia >= 0 ? '+' : '−'}{dinero(Math.abs(Math.round(diferencia * 100) / 100))}</Badge>
              <span className="sr-only">Tesorería antes y después de las semanas</span>
            </div>

            {resumen.avisos.length > 0 && (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
                {resumen.avisos.map((a) => (
                  <li key={a} style={{ ...textoSuave, color: tone.topacio.fg, display: 'flex', gap: 6 }}>
                    <AlertTriangle size={15} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} /> {a}
                  </li>
                ))}
              </ul>
            )}

            {resultado
              ? <MercadoResultado resumen={resultado.resumen} riesgo={catalogo.mercadoNegro?.riesgo ?? 0} dinero={dinero} />
              : <MercadoPrevision resumen={resumen} riesgo={catalogo.mercadoNegro?.riesgo ?? 0} dinero={dinero} />}

            <Bloque titulo="Ingresos" vacio="Sin ingresos fijos." lineas={resumen.ingresos} signo="+" dinero={dinero} total={total(resumen.ingresos)} />
            <Bloque titulo="Mantenimiento" vacio="Ningún refugio paga mantenimiento." lineas={resumen.mantenimiento} signo="−" dinero={dinero} total={total(resumen.mantenimiento)} />
            <Bloque
              titulo="Sueldos"
              vacio="Nadie cobra sueldo."
              lineas={resumen.sueldos}
              signo="−"
              dinero={dinero}
              total={resumen.sueldos.filter((s) => s.pagado).reduce((s, x) => s + x.importe, 0)}
              marca={(l) => ('pagado' in l && !l.pagado ? <Badge tone="rubi">Sin cobrar</Badge> : null)}
            />

            <section>
              <h3 style={{ ...titulo, marginBottom: 6 }}>Obras</h3>
              {resumen.obras.length === 0 ? (
                <p style={textoSuave}>No hay obras en marcha.</p>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
                  {resumen.obras.map((o, i) => (
                    <li key={`${o.refugio}-${o.mejora}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: fs.sm, color: c.text }}>
                      <span style={{ flex: 1, minWidth: 0 }}>{o.reparacion ? `Reparación: ${o.mejora}` : o.mejora} · {o.refugio}</span>
                      <span style={{ color: c.muted }}>{o.antes} → {o.despues} {o.despues === 1 ? 'semana' : 'semanas'}</span>
                      {o.termina && <Badge tone="esmeralda">Termina</Badge>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {(resumen.cartel.caducados.length > 0 || resumen.cartel.fueraDePlazo.length > 0) && (
              <section>
                <h3 style={{ ...titulo, marginBottom: 6 }}>Cartel</h3>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
                  {resumen.cartel.caducados.map((a) => (
                    <li key={`caducado-${a.nombre}`} style={{ fontSize: fs.sm, color: c.text }}>
                      <Badge tone="rubi">Caduca</Badge> {a.nombre}
                      {a.siCaduca && <span style={{ display: 'block', color: c.muted, marginTop: 2 }}>Si caduca (solo tú): {a.siCaduca}</span>}
                    </li>
                  ))}
                  {resumen.cartel.fueraDePlazo.map((n) => (
                    <li key={`plazo-${n}`} style={{ fontSize: fs.sm, color: c.text }}>
                      <Badge tone="topacio">Fuera de plazo</Badge> {n}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {resumen.lealtad.length > 0 && (
              <section>
                <h3 style={{ ...titulo, marginBottom: 6 }}>Lealtad (solo tú)</h3>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
                  {resumen.lealtad.map((l) => (
                    <li key={l.nombre} style={{ fontSize: fs.sm, color: c.text }}>
                      {l.nombre}: {l.antes} → {l.despues} <span style={{ color: c.muted }}>({l.nota})</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

/** An event came up: the event (and, when it damages, the upgrades to validate) and the weeks rolled so far, for the director to decide */
function PasoSuceso({ pasada, semanas, tabla, era, danables, onDano }: {
  pasada: Pasada
  semanas: number
  tabla: TablaSucesosDef
  era: Era | null
  danables: MejoraDanable[]
  onDano: (clave: string, si: boolean) => void
}) {
  const ultima = pasada.semanas[pasada.semanas.length - 1]
  const s = ultima.suceso
  const faltan = semanas - ultima.semana
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {s && (
        <div style={{ padding: 14, borderRadius: radius.md, background: tone.topacio.bg, border: `1px solid ${tone.topacio.border}`, display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h3 style={titulo}>{s.def?.titulo ?? 'Suceso'}</h3>
            {s.def?.provisional && <Badge tone="cuarzo">Provisional</Badge>}
          </div>
          {s.def && <p style={{ fontSize: fs.sm, color: c.text, lineHeight: 1.5 }}>{textoEra(s.def.texto, era)}</p>}
          <p style={{ fontSize: fs.xs, color: c.muted }}>
            ¿Pasa algo? Sacó {ultima.tirada} (hacía falta {ultima.umbral} o más) · ¿Qué pasa? Sacó {s.tirada} en la tabla
          </p>
        </div>
      )}
      {s?.def?.efecto && <ValidarDanos danables={danables} elegidos={pasada.danos} onDano={onDano} />}
      <p style={textoSuave}>
        {faltan > 0
          ? `Si paras para jugarlo, pasan ${ultima.semana} de ${semanas} semanas y ${faltan === 1 ? 'la que falta se queda' : `las ${faltan} que faltan se quedan`} sin pasar. Si lo omites, se sigue tirando.`
          : semanas === 1
            ? 'Es la única semana: pasa tanto si lo juegas como si lo omites.'
            : `Es la última semana: pasan las ${semanas} tanto si lo juegas como si lo omites.`}
      </p>
      <section style={{ display: 'grid', gap: 6 }}>
        <h3 style={titulo}>Semanas</h3>
        <SemanasTiradas semanas={pasada.semanas} dado={tabla.dado} />
      </section>
    </div>
  )
}

/**
 * The upgrades an event that damages would hit, proposed at random: the director leaves marked the ones it really hits. A damaged one
 * damaged again breaks and is lost. Nothing applies if he skips the event
 */
function ValidarDanos({ danables, elegidos, onDano }: { danables: MejoraDanable[]; elegidos: string[]; onDano: (clave: string, si: boolean) => void }) {
  if (danables.length === 0) return <p style={textoSuave}>No hay mejoras que estropear: el suceso no daña nada.</p>
  const refugios = [...new Set(danables.map((d) => d.refugioId))]
  return (
    <section style={{ display: 'grid', gap: 8 }}>
      <h3 style={titulo}>Qué se estropea</h3>
      <p style={{ ...textoSuave, fontSize: fs.xs }}>
        La app propone las marcadas; deja solo las que de verdad se estropean. Se aplica si juegas el suceso; si lo omites, no pasa nada.
      </p>
      {refugios.map((id) => {
        const del = danables.filter((d) => d.refugioId === id)
        return (
          <div key={id} style={{ display: 'grid', gap: 2 }}>
            <span style={{ fontSize: fs.xs, fontWeight: 650, color: c.muted }}>{del[0].refugio}</span>
            {del.map((d) => (
              <label key={d.clave} className="ui-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 4px', cursor: 'pointer' }}>
                <span style={{ display: 'grid', gap: 2 }}>
                  <span style={{ fontSize: fs.sm, color: c.text }}>{d.nombre}</span>
                  <span style={{ fontSize: fs.xs, color: d.rompe ? tone.rubi.fg : c.muted }}>{d.rompe ? 'Ya está dañada: se romperá y se perderá' : 'Quedará dañada'}</span>
                </span>
                <Switch checked={elegidos.includes(d.clave)} onChange={(si) => onDano(d.clave, si)} label={`Estropear ${d.nombre} de ${d.refugio}`} />
              </label>
            ))}
          </div>
        )
      })}
    </section>
  )
}

/** Each week rolled for events: nothing, or what happened and what the director did with it */
function SemanasTiradas({ semanas, dado }: { semanas: SemanaSucesos[]; dado: number }) {
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
      {semanas.map((s) => (
        <li key={s.semana} style={{ display: 'grid', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: fs.sm }}>
            <span style={{ fontWeight: 650, color: c.text }}>Semana {s.semana}</span>
            <span style={{ color: s.suceso ? c.text : c.muted }}>{s.suceso ? (s.suceso.def?.titulo ?? 'Suceso') : 'No pasa nada'}</span>
            {s.suceso?.decision && (
              <Badge tone={s.suceso.decision === 'jugado' ? 'topacio' : 'cuarzo'}>{s.suceso.decision === 'jugado' ? 'Jugado' : 'Omitido'}</Badge>
            )}
          </div>
          <span style={{ fontSize: fs.xs, color: c.subtle }}>
            1d{dado}: {s.tirada} (hacía falta {s.umbral} o más){s.suceso ? ` · en la tabla: ${s.suceso.tirada}` : ''}
          </span>
          {!!s.suceso?.efectos?.length && <span style={{ fontSize: fs.xs, color: tone.rubi.fg }}>{s.suceso.efectos.join(' · ')}</span>}
        </li>
      ))}
    </ol>
  )
}

/** What the events dice did this time: only the director sees it, and it stays in his private ledger */
function SucesosResultado({ resultado, tabla }: { resultado: Resultado; tabla: TablaSucesosDef | null }) {
  if (!tabla) return null
  if (!resultado.sucesos) return <p style={textoSuave}>Sin sucesos: estas semanas han pasado sin tirar.</p>
  const pasadas = resultado.resumen.semanas
  const faltan = resultado.deSemanas - pasadas
  const umbral = umbralSuceso(tabla, resultado.sinSuceso)
  return (
    <section style={{ display: 'grid', gap: 8 }}>
      <h3 style={titulo}>Sucesos</h3>
      <p style={{ ...textoSuave, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <Lock size={14} aria-hidden style={{ flexShrink: 0, marginTop: 3 }} />
        Solo lo ves tú: queda en tu registro, no en el de la banda.
      </p>
      {faltan > 0 && (
        <p style={{ ...textoSuave, color: tone.topacio.fg }}>
          Has parado en la semana {pasadas} de {resultado.deSemanas}: {faltan === 1 ? 'queda 1 semana' : `quedan ${faltan} semanas`} por pasar.
        </p>
      )}
      <SemanasTiradas semanas={resultado.sucesos} dado={tabla.dado} />
      <p style={{ ...textoSuave, fontSize: fs.xs }}>
        La próxima semana pasa algo con un {umbral} o más ({probabilidadSuceso(tabla, umbral)} %).
      </p>
    </section>
  )
}

const cajaLote = { padding: '10px 12px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`, display: 'grid', gap: 6 } as const

/** Each lot on the black market before rolling: its chance each week and in the whole period, and what the crew adds */
function MercadoPrevision({ resumen, riesgo, dinero }: { resumen: ResumenSemanas; riesgo: number; dinero: (v: number) => string }) {
  if (resumen.previsionMercado.length === 0) return null
  const n = resumen.semanas
  return (
    <section style={{ display: 'grid', gap: 8 }}>
      <h3 style={titulo}>Mercado negro</h3>
      <p style={textoSuave}>Se tira al confirmar: lo que se venda aún no cuenta en la tesorería de arriba.</p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
        {resumen.previsionMercado.map((l) => (
          <li key={l.id} style={cajaLote}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: fs.sm, fontWeight: 650, color: c.text }}>{l.nombre}</span>
              <Badge tone="gold">{dinero(l.importe)}</Badge>
              <Badge tone={tonoProbabilidad(l.acumulada)}>{l.acumulada} % en {n} {n === 1 ? 'semana' : 'semanas'}</Badge>
            </div>
            <p style={{ fontSize: fs.xs, color: c.muted }}>
              {l.probs.every((p) => p === 0)
                ? 'A ese precio nadie lo compra.'
                : `Por semana: ${l.probs.map((p) => `${p} %`).join(' · ')}`}
            </p>
          </li>
        ))}
      </ul>
      <p style={textoSuave}>
        La banda suma: {resumen.puntosMercado.length ? resumen.puntosMercado.map((p) => `${p.concepto} ${conSigno(p.puntos)}`).join(' · ') : 'nada'}.
      </p>
      <p style={textoSuave}>
        Cada semana sin vender, un {riesgo} % de soplo (Notoriedad +1{resumen.sinEscondite ? ' y, sin escondite, la mercancía se requisa' : '; el escondite la salva'}).
      </p>
    </section>
  )
}

/** What the black market did with each lot, week by week: its chance and its roll */
function MercadoResultado({ resumen, riesgo, dinero }: { resumen: ResumenSemanas; riesgo: number; dinero: (v: number) => string }) {
  if (resumen.mercado.length === 0) return null
  return (
    <section style={{ display: 'grid', gap: 8 }}>
      <h3 style={titulo}>Mercado negro</h3>
      <p style={textoSuave}>El registro de la banda solo cuenta lo que pasó, sin probabilidades ni tiradas.</p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
        {resumen.mercado.map((l) => (
          <li key={l.id} style={cajaLote}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: fs.sm, fontWeight: 650, color: c.text }}>{l.nombre}</span>
              {l.soplo && <Badge tone="rubi">Soplo</Badge>}
              {l.vendida
                ? <Badge tone="esmeralda">Vendido · +{dinero(l.importe)}</Badge>
                : l.requisada ? <Badge tone="rubi">Requisado</Badge> : <Badge tone="cuarzo">Sigue a la venta</Badge>}
            </div>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 2 }}>
              {l.semanas.map((s, i) => {
                const vende = s.tirada <= s.prob
                const soplo = !vende && s.tirada > 100 - riesgo
                return (
                  <li key={i} style={{ fontSize: fs.xs, color: vende ? tone.esmeralda.fg : soplo ? tone.rubi.fg : c.muted }}>
                    Semana {i + 1}: {s.prob} % · sacó {s.tirada}{vende ? ' · se vende' : soplo ? ' · soplo' : ''}
                  </li>
                )
              })}
            </ol>
          </li>
        ))}
      </ul>
      {resumen.notoriedadSube && <p style={{ ...textoSuave, color: tone.rubi.fg }}>La Notoriedad sube 1 por el soplo.</p>}
    </section>
  )
}

function Bloque<L extends LineaImporte>({ titulo: nombre, vacio, lineas, signo, dinero, total, marca }: {
  titulo: string
  vacio: string
  lineas: L[]
  signo: '+' | '−'
  dinero: (v: number) => string
  total: number
  marca?: (l: L) => ReactNode
}) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <h3 style={titulo}>{nombre}</h3>
        {lineas.length > 0 && <span style={{ ...numeral, fontSize: fs.md, color: c.text }}>{signo}{dinero(Math.round(total * 100) / 100)}</span>}
      </div>
      {lineas.length === 0 ? (
        <p style={textoSuave}>{vacio}</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
          {lineas.map((l, i) => (
            <li key={`${l.concepto}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: fs.sm, color: c.text }}>{l.concepto}</span>
                <span style={{ display: 'block', fontSize: fs.xs, color: c.muted }}>{l.detalle}</span>
              </span>
              {marca?.(l)}
              <span style={{ ...numeral, fontSize: fs.sm, color: c.text }}>{signo}{dinero(l.importe)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
