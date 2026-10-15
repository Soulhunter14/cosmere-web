/**
 * «Pasar semanas»: what happens to the crew while time goes by (docs/banda/propuesta.md §2.6). One pure function computes both the summary
 * the director reads before confirming and the sheet after it, so what is shown is exactly what is applied:
 * - costs: the wage of every worker who is with the crew and active or wounded, and the upkeep of every refuge not lost (a safe house
 *   without upgrades costs nothing); in Era 1 the siege's scarcity multiplies both, except the upkeep of a refuge with a Despensa;
 *   a cook posted at the Despensa lowers that refuge's upkeep by 25 %;
 * - income: a commercial company's monthly profit (by scale, a month = `semanasPorMes` weeks; +50 % with an administrator in the crew)
 *   and every working Tapadera (with its administrator at the post);
 * - payment: upkeep first, then wages in hiring order; whoever cannot be paid loses 1 loyalty (a loyal worker takes the first unpaid
 *   phase without losing it);
 * - works: every work in progress, repairs included, advances the weeks that pass (an artisan at the refuge shortens it one more week,
 *   once); a finished repair leaves the upgrade ready;
 * - black market (docs/banda/propuesta-mercado-negro.md): the summary always has each lot's chances (only the director runs this, so he
 *   can comment them with the players); the sales happen only with the rolls his page makes when confirming. What sells is income of the
 *   period; a tip-off raises notoriety once and, without a hiding place, the goods are seized; the rest add the weeks to their time on
 *   sale. The public ledger never shows the chances nor the rolls;
 * - events («Cosas que pueden pasar», sucesos.ts): the page rolls them week by week and stops at each one for the director to play it
 *   (the weeks pass up to it) or skip it; they and their internal value go to his private part, never to the public ledger. A played
 *   event damages the upgrades he validated (a damaged one damaged again breaks); the public ledger says what broke, never why.
 */
import { enEra, textoEra } from '../../lib/banda/tipos'
import { MAX_SUCESOS, nombreLote, nuevoId, type MejoraRefugio, type Mercancia, type SucesoTirado, type TrabajadorPrivado } from './estado'
import type { SemanaSucesos } from './sucesos'
import {
  ErrorBanda, anotar, capacidadUsada, danarMejoras, nombreMejora, privadoDe, type CtxBanda, type DocBanda, type OpBanda,
} from './operaciones'
import {
  probabilidadAcumulada, probabilidadVenta, puntosDeLaBanda, tieneEscondite, tirarLote, type LineaPuntos, type ResultadoLote,
} from './mercadoNegro'

export interface LineaImporte {
  concepto: string
  detalle: string
  /** For the whole period, always positive */
  importe: number
}

export interface ResumenSemanas {
  semanas: number
  contexto: { nombre: string; multiplicador: number } | null
  ingresos: LineaImporte[]
  mantenimiento: LineaImporte[]
  sueldos: (LineaImporte & { pagado: boolean })[]
  obras: { refugio: string; mejora: string; antes: number; despues: number; termina: boolean; reparacion: boolean }[]
  /** Private: only the director sees it */
  lealtad: { nombre: string; antes: number; despues: number; nota: string }[]
  /**
   * Each lot on the black market when the weeks start, with its chance of selling each week and in the whole period (it assumes it
   * stays unsold: each week adds to its time on sale). Only the director runs «Pasar semanas», so he can comment it with the players
   */
  previsionMercado: { id: string; nombre: string; importe: number; probs: number[]; acumulada: number }[]
  /** What the crew adds to every lot (its smuggler, its workers at the Almacén, its type, its notoriety) */
  puntosMercado: LineaPuntos[]
  /** A tip-off costs the goods (there is no hiding place ready) */
  sinEscondite: boolean
  /** Only once rolled: each lot on sale, week by week, with its chances and rolls */
  mercado: (ResultadoLote & { id: string; nombre: string; importe: number })[]
  /** A tip-off raised the notoriety (once, whatever the number of tip-offs) */
  notoriedadSube: boolean
  tesoreriaAntes: number
  tesoreriaDespues: number
  avisos: string[]
}

/** Rolls of the black market by lot id: one d100 per week (made by the page, see tirarD100) */
export type TiradasMercado = Record<string, number[]>

const redondear = (v: number) => Math.round(v * 100) / 100
const cobra = (p: TrabajadorPrivado) => p.estado === 'activo' || p.estado === 'herido'

export function simularSemanas(
  doc: DocBanda, ctx: CtxBanda, semanas: number, contextoId: string | null, tiradas?: TiradasMercado,
): { resumen: ResumenSemanas; doc: DocBanda } {
  const { catalogo: cat, era } = ctx
  const b0 = doc.banda
  const ctxDef = contextoId ? cat.contextos.find((c) => c.id === contextoId) : undefined
  const mult = ctxDef?.multiplicador ?? 1
  const avisos: string[] = []

  // Who is with the crew, with their private data
  const plantilla = b0.trabajadores.filter((t) => t.enBanda).map((t) => ({ t, p: privadoDe(t, doc.secretos, cat) }))
  const activos = plantilla.filter(({ p }) => cobra(p))
  const oficioDe = (id: string) => cat.oficios.find((o) => o.id === id)
  const enPuesto = (refugioId: string, mejoraId?: string) =>
    activos.filter(({ p }) => p.puesto?.refugio === refugioId && (mejoraId === undefined || p.puesto.mejora === mejoraId))
  const lista = (m: MejoraRefugio) => m.estado === 'lista'

  // ── Upkeep ──
  const mantenimiento: LineaImporte[] = []
  for (const r of b0.refugios) {
    if (r.estado === 'perdido') continue
    const tipo = cat.tiposRefugio.find((t) => t.id === r.tipo)
    if (!r.principal && capacidadUsada(r) === 0) continue // a safe house without upgrades costs nothing
    let semanal = enEra(tipo?.mantenimiento, era) ?? 0
    for (const m of r.mejoras.filter(lista)) semanal += enEra(cat.mejorasRefugio.find((d) => d.id === m.mejora)?.mantenimientoExtra, era) ?? 0
    const despensa = r.mejoras.find((m) => lista(m) && cat.mejorasRefugio.find((d) => d.id === m.mejora)?.libraEscasez)
    const factor = despensa ? 1 : mult
    let total = semanal * factor * semanas
    const notas: string[] = []
    if (factor !== 1) notas.push(`escasez ×${String(factor).replace('.', ',')}`)
    if (despensa && mult !== 1) notas.push('la Despensa evita la escasez')
    // A cook at the Despensa lowers the upkeep of their refuge
    const pct = despensa
      ? enPuesto(r.id, despensa.id).reduce((s, { t }) => s + (oficioDe(t.oficio)?.puesto?.efecto?.mantenimientoPct ?? 0), 0)
      : 0
    if (pct) {
      total = total * (1 + pct / 100)
      notas.push(`cocina ${pct} %`)
    }
    total = redondear(total)
    if (total > 0) mantenimiento.push({ concepto: r.nombre, detalle: [`${ctx.dinero(semanal)} por semana`, ...notas].join(' · '), importe: total })
  }

  // ── Income ──
  const ingresos: LineaImporte[] = []
  const tipoOrg = cat.tiposOrganizacion.find((t) => t.id === b0.tipoOrganizacion)
  if (tipoOrg?.beneficioMensual?.length) {
    const mensual = enEra(tipoOrg.beneficioMensual[Math.min(b0.escala, tipoOrg.beneficioMensual.length) - 1], era) ?? 0
    const pct = activos.reduce((s, { t }) => Math.max(s, oficioDe(t.oficio)?.puesto?.efecto?.beneficioPct ?? 0), 0)
    const total = redondear((mensual / cat.semanasPorMes) * semanas * (1 + pct / 100))
    if (total > 0) {
      ingresos.push({ concepto: `${tipoOrg.nombre} (escala ${b0.escala})`, detalle: `${ctx.dinero(mensual)} al mes${pct ? ` · administración +${pct} %` : ''}`, importe: total })
    }
  }
  for (const r of b0.refugios) {
    if (r.estado === 'perdido') continue
    for (const m of r.mejoras.filter(lista)) {
      const def = cat.mejorasRefugio.find((d) => d.id === m.mejora)
      const semanal = enEra(def?.ingresoSemanal, era)
      if (!def || !semanal) continue
      // It only works with its worker at the post (Tapadera: an administrator)
      const conPuesto = !def.requiereOficio || enPuesto(r.id, m.id).some(({ t }) => t.oficio === def.requiereOficio)
      if (!conPuesto) {
        avisos.push(`${def.nombre} de ${r.nombre} no da dinero: le falta su trabajador en el puesto.`)
        continue
      }
      ingresos.push({ concepto: `${def.nombre} · ${r.nombre}`, detalle: `${ctx.dinero(semanal)} por semana`, importe: redondear(semanal * semanas) })
    }
  }

  // ── Black market: the chances always; the sales only with the director's rolls (a lot put on sale after he confirmed has none: it
  // waits for the next time) ──
  const enVenta = cat.mercadoNegro ? b0.almacen.filter((m) => m.situacion === 'en-venta' && m.precio !== null) : []
  const escondite = tieneEscondite(doc, cat)
  const previsionMercado: ResumenSemanas['previsionMercado'] = enVenta.map((m) => {
    const probs = Array.from({ length: semanas }, (_, i) => probabilidadVenta(m.valor, m.precio ?? 0, m.semanasALaVenta + i, doc, cat, contextoId)?.prob ?? 0)
    return { id: m.id, nombre: nombreLote(m), importe: redondear((m.precio ?? 0) * m.cantidad), probs, acumulada: probabilidadAcumulada(probs) }
  })
  const mercado: ResumenSemanas['mercado'] = []
  let almacen = b0.almacen
  if (tiradas && cat.mercadoNegro) {
    const cambios = new Map<string, Partial<Mercancia>>()
    for (const m of enVenta) {
      const t = tiradas[m.id]
      if (!t) continue
      const r = tirarLote(m, t, semanas, doc, cat, contextoId, escondite)
      const importe = redondear((m.precio ?? 0) * m.cantidad)
      mercado.push({ ...r, id: m.id, nombre: nombreLote(m), importe })
      if (r.vendida) {
        cambios.set(m.id, { situacion: 'vendida', precio: null, cerradaEn: ctx.ahora, importeVenta: importe })
        ingresos.push({ concepto: `Mercado negro · ${nombreLote(m)}`, detalle: `vendido la semana ${r.semana}`, importe })
      } else if (r.requisada) {
        cambios.set(m.id, { situacion: 'requisada', precio: null, cerradaEn: ctx.ahora })
      } else {
        cambios.set(m.id, { semanasALaVenta: m.semanasALaVenta + semanas })
      }
    }
    almacen = b0.almacen.map((m) => (cambios.has(m.id) ? { ...m, ...cambios.get(m.id) } : m))
  }
  const notoriedadSube = mercado.some((l) => l.soplo) && b0.notoriedad < cat.notoriedadMaxima

  // ── Payment: upkeep first, then wages in hiring order ──
  const tesoreriaAntes = b0.tesoreria
  const totalIngresos = redondear(ingresos.reduce((s, l) => s + l.importe, 0))
  const totalMantenimiento = redondear(mantenimiento.reduce((s, l) => s + l.importe, 0))
  let caja = redondear(tesoreriaAntes + totalIngresos - totalMantenimiento)
  if (caja < 0) {
    avisos.push(`No llega para el mantenimiento: faltan ${ctx.dinero(-caja)}. La tesorería se queda a 0.`)
    caja = 0
  }
  const sueldos: ResumenSemanas['sueldos'] = []
  const privados: Record<string, TrabajadorPrivado> = { ...doc.secretos.trabajadores }
  const lealtad: ResumenSemanas['lealtad'] = []
  for (const { t, p } of [...activos].sort((a, c) => a.t.desde.localeCompare(c.t.desde))) {
    const importe = redondear(t.sueldo * mult * semanas)
    const pagado = importe <= caja
    if (pagado) caja = redondear(caja - importe)
    sueldos.push({ concepto: t.nombre, detalle: `${ctx.dinero(t.sueldo)} por semana${mult !== 1 ? ` · escasez ×${String(mult).replace('.', ',')}` : ''}`, importe, pagado })
    if (importe === 0) continue
    if (pagado) {
      if (p.fasesSinCobrar) privados[t.id] = { ...p, fasesSinCobrar: 0 }
    } else if (p.lealtad >= 3 && p.fasesSinCobrar === 0) {
      privados[t.id] = { ...p, fasesSinCobrar: 1 }
      lealtad.push({ nombre: t.nombre, antes: p.lealtad, despues: p.lealtad, nota: 'leal: aguanta esta vez sin cobrar' })
    } else {
      const despues = Math.max(0, p.lealtad - 1)
      privados[t.id] = { ...p, lealtad: despues, fasesSinCobrar: p.fasesSinCobrar + 1 }
      lealtad.push({ nombre: t.nombre, antes: p.lealtad, despues, nota: despues === 0 ? 'está a punto de irse' : 'no cobra' })
    }
  }
  const impagados = sueldos.filter((s) => !s.pagado && s.importe > 0)
  if (impagados.length) avisos.push(`No llega para los sueldos de ${impagados.map((s) => s.concepto).join(', ')}.`)

  // ── Works ──
  const obras: ResumenSemanas['obras'] = []
  const refugios = b0.refugios.map((r) => {
    if (r.estado === 'perdido') return r
    const artesano = enPuesto(r.id).some(({ t }) => oficioDe(t.oficio)?.puesto?.efecto?.obraSemanaExtra)
    return {
      ...r,
      mejoras: r.mejoras.map((m) => {
        if (m.estado !== 'en-obra') return m
        const extra = artesano && !m.bonoArtesano ? 1 : 0
        const despues = Math.max(0, m.semanasRestantes - semanas - extra)
        obras.push({ refugio: r.nombre, mejora: nombreMejora(m, cat), antes: m.semanasRestantes, despues, termina: despues === 0, reparacion: !!m.reparacion })
        return {
          ...m, semanasRestantes: despues, estado: despues === 0 ? 'lista' as const : m.estado, bonoArtesano: m.bonoArtesano || extra > 0,
          reparacion: despues === 0 ? null : m.reparacion,
        }
      }),
    }
  })

  const tesoreriaDespues = caja
  const resumen: ResumenSemanas = {
    semanas,
    contexto: ctxDef && ctxDef.multiplicador !== 1 ? { nombre: ctxDef.nombre, multiplicador: ctxDef.multiplicador } : null,
    ingresos, mantenimiento, sueldos, obras, lealtad,
    previsionMercado, puntosMercado: enVenta.length ? puntosDeLaBanda(doc, cat) : [], sinEscondite: !escondite, mercado, notoriedadSube,
    tesoreriaAntes, tesoreriaDespues, avisos,
  }

  // ── The sheet after it ──
  const partes = [
    totalIngresos ? `ingresos +${ctx.dinero(totalIngresos)}` : '',
    totalMantenimiento ? `mantenimiento −${ctx.dinero(totalMantenimiento)}` : '',
    sueldos.some((s) => s.pagado && s.importe) ? `sueldos −${ctx.dinero(redondear(sueldos.filter((s) => s.pagado).reduce((s, l) => s + l.importe, 0)))}` : '',
    impagados.length ? `sin cobrar: ${impagados.map((s) => s.concepto).join(', ')}` : '',
  ].filter(Boolean)
  const notoriedad = notoriedadSube ? b0.notoriedad + 1 : b0.notoriedad
  let banda = anotar({ ...b0, refugios, almacen, notoriedad, escasez: contextoId, tesoreria: tesoreriaDespues }, ctx, {
    tipo: 'semanas', actor: { tipo: 'director', nombre: ctx.autor }, dinero: redondear(tesoreriaDespues - tesoreriaAntes),
    motivo: `${semanas === 1 ? 'Pasa 1 semana' : `Pasan ${semanas} semanas`}${resumen.contexto ? ` (${resumen.contexto.nombre})` : ''}${partes.length ? `: ${partes.join(' · ')}` : ''}`,
  })
  for (const o of obras.filter((x) => x.termina)) {
    banda = anotar(banda, ctx, { tipo: 'mejora', objetivo: o.mejora, motivo: `${o.reparacion ? 'Reparada' : 'Obra terminada'}: ${o.mejora} en ${o.refugio}` })
  }
  // The black market in the public ledger: what sold and the tip-offs, never the chances nor the rolls (the money is already in the
  // weeks' movement above)
  for (const l of mercado) {
    if (l.soplo) {
      banda = anotar(banda, ctx, {
        tipo: 'mercado', objetivo: l.nombre,
        motivo: l.requisada ? `Un soplo: requisan ${l.nombre}` : `Un soplo sobre ${l.nombre}: el escondite lo salva`,
      })
    }
    if (l.vendida) {
      const actor = b0.almacen.find((m) => m.id === l.id)?.puestaPor ?? undefined
      banda = anotar(banda, ctx, {
        tipo: 'mercado', ...(actor ? { actor } : {}), objetivo: l.nombre,
        motivo: `Vendido en el mercado negro: ${l.nombre} por ${ctx.dinero(l.importe)} (semana ${l.semana} de ${semanas})`,
      })
    }
  }
  if (notoriedadSube) banda = anotar(banda, ctx, { tipo: 'notoriedad', cantidad: 1, motivo: 'Un soplo en el mercado negro' })
  return { resumen, doc: { banda, secretos: { ...doc.secretos, trabajadores: privados } } }
}

/** What the events dice said while these weeks passed (only when the director rolls them) */
export interface SucesosDeLaPasada {
  /** Every week rolled, with the director's decision on each event */
  semanas: SemanaSucesos[]
  /** Quiet weeks in a row after them: the internal value it leaves */
  sinSuceso: number
  /** Weeks the director wanted to pass (they stop at an event he plays) */
  deSemanas: number
}

/**
 * The events of this time into the director's private part, most recent first, with the internal value they leave. A played event that
 * damages applies it to the upgrades he validated (a skipped one does nothing)
 */
function anotarSucesos(doc: DocBanda, ctx: CtxBanda, sucesos: SucesosDeLaPasada, ids: string[]): DocBanda {
  let actual = doc
  const nuevos: SucesoTirado[] = []
  sucesos.semanas.forEach((s, i) => {
    if (!s.suceso?.decision) return
    let efectos: string[] = []
    if (s.suceso.decision === 'jugado' && s.suceso.danos?.length) {
      const r = danarMejoras(actual, ctx, s.suceso.danos)
      actual = r.doc
      efectos = r.efectos
    }
    nuevos.push({
      id: ids[i], en: ctx.ahora, autor: ctx.autor, semana: s.semana, deSemanas: sucesos.deSemanas, tirada: s.tirada, umbral: s.umbral,
      tiradaTabla: s.suceso.tirada, titulo: s.suceso.def?.titulo ?? 'Suceso', texto: textoEra(s.suceso.def?.texto, ctx.era),
      provisional: !!s.suceso.def?.provisional, decision: s.suceso.decision, efectos,
    })
  })
  return {
    ...actual,
    secretos: {
      ...actual.secretos,
      semanasSinSuceso: sucesos.sinSuceso,
      sucesos: [...nuevos.reverse(), ...actual.secretos.sucesos].slice(0, MAX_SUCESOS),
    },
  }
}

/**
 * Weeks pass (director): wages, upkeep, profits, works, loyalty and, with the page's rolls, the black market, exactly as the summary of
 * `simularSemanas` shows with the same rolls; and the events the page rolled, when there are (without them the internal value stays)
 */
export const pasarSemanas = (semanas: number, contexto: string | null, tiradas?: TiradasMercado, sucesos?: SucesosDeLaPasada): OpBanda => {
  // Ids fixed when the operation is built: applied again after a 409, it names the same events
  const ids = (sucesos?.semanas ?? []).map(() => nuevoId())
  return (doc, ctx) => {
    if (!Number.isInteger(semanas) || semanas < 1) throw new ErrorBanda('Indica cuántas semanas pasan.')
    const despues = simularSemanas(doc, ctx, semanas, contexto, tiradas).doc
    return sucesos ? anotarSucesos(despues, ctx, sucesos, ids) : despues
  }
}
