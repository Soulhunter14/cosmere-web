/**
 * Candidates: the only way to hire workers. The director generates them (name, trade, faction, a trait everyone sees and, in his private
 * part, rank and metal from the trade, loyalty 1 and maybe a secret), edits them and publishes them; a character hires one, and it
 * becomes a worker with the private part the director prepared under the same id. They do not expire: the director withdraws them.
 * The generator rolls with Math.random in the page; the operations below are pure, like the rest of the sheet's.
 */
import type { CatalogoBanda } from '../../lib/banda/tipos'
import type { Era } from '../../types'
import { isAvailable } from '../../worlds'
import { nuevoId, type Actor, type BandaEstado, type Candidato, type TrabajadorPrivado } from './estado'
import { ErrorBanda, anotar, contratar, nombreOficio, sueldoSugerido, type DocBanda, type OpBanda } from './operaciones'

/** The public part of a candidate as the director edits it before publishing */
export interface DatosCandidato {
  nombre: string
  oficio: string
  sueldo: number
  faccion: string | null
  rasgo: string
}

/** A candidate being prepared: what everyone will see, the director's private part and its secret */
export interface BorradorCandidato {
  publico: DatosCandidato
  privado: TrabajadorPrivado
  secreto: string
}

const elegir = <T,>(lista: readonly T[], azar: () => number): T | undefined => (lista.length ? lista[Math.floor(azar() * lista.length)] : undefined)

/** Rank and metal come from the trade (no other metalborn); the wage is the one suggested for them */
export function datosDeOficio(cat: CatalogoBanda, era: Era | null, oficioId: string) {
  const oficio = cat.oficios.find((o) => o.id === oficioId)
  const rango = oficio?.rango ?? 'secuaz'
  const metal = oficio?.metal ?? null
  return { rango, metal, sueldo: sueldoSugerido(cat, era, rango, !!metal) }
}

/**
 * A new candidate: of the trade asked for (or one of the era's, at random), a name nobody in the crew or among the candidates has, maybe
 * a faction of the era, a trait, and in the private part the trade's rank and metal, loyalty 1 and maybe a secret
 */
export function generarCandidato(
  cat: CatalogoBanda, era: Era | null, banda: BandaEstado, oficioId: string | null, azar: () => number = Math.random,
): BorradorCandidato {
  const gen = cat.generadorCandidatos
  const oficios = cat.oficios.filter((o) => isAvailable(o, era))
  const oficio = (oficioId ? oficios.find((o) => o.id === oficioId) : undefined) ?? elegir(oficios, azar)
  const usados = new Set([...banda.trabajadores.map((t) => t.nombre), ...banda.candidatos.map((c) => c.nombre)])
  const nombres = (era ? gen.nombres[era] : undefined) ?? Object.values(gen.nombres)[0] ?? []
  const libres = nombres.filter((n) => !usados.has(n))
  const facciones = cat.facciones.filter((f) => isAvailable(f, era) && !f.enemiga)
  const { rango, metal, sueldo } = datosDeOficio(cat, era, oficio?.id ?? '')
  return {
    publico: {
      nombre: elegir(libres.length ? libres : nombres, azar) ?? '',
      oficio: oficio?.id ?? 'propio',
      sueldo,
      faccion: azar() * 100 < gen.conFaccion ? (elegir(facciones, azar)?.id ?? null) : null,
      rasgo: elegir(gen.rasgos, azar) ?? '',
    },
    privado: { rango, nacidoDelMetal: metal, lealtad: 1, estado: 'activo', puesto: null, notas: '', fasesSinCobrar: 0 },
    secreto: azar() * 100 < gen.conSecreto ? (elegir(gen.secretos, azar) ?? '') : '',
  }
}

const redondear = (v: number) => Math.round(v * 100) / 100

/** The director publishes candidates: the public part for everyone, the private part and the secret in his, under the same id */
export const publicarCandidatos = (borradores: BorradorCandidato[]): OpBanda => {
  const ids = borradores.map(() => nuevoId())
  return (doc, ctx) => {
    if (borradores.length === 0) throw new ErrorBanda('No hay candidatos que publicar.')
    let banda = doc.banda
    let secretos = doc.secretos
    borradores.forEach(({ publico, privado, secreto }, i) => {
      const nombre = publico.nombre.trim()
      if (!nombre) throw new ErrorBanda('A un candidato le falta el nombre.')
      if (!ctx.catalogo.oficios.some((o) => o.id === publico.oficio)) throw new ErrorBanda(`Elige el oficio de ${nombre}.`)
      if (!Number.isFinite(publico.sueldo) || publico.sueldo < 0) throw new ErrorBanda(`El sueldo de ${nombre} no es válido.`)
      const candidato: Candidato = {
        id: ids[i], nombre, oficio: publico.oficio, sueldo: redondear(publico.sueldo), faccion: publico.faccion, rasgo: publico.rasgo.trim(),
        desde: ctx.ahora,
      }
      banda = anotar({ ...banda, candidatos: [...banda.candidatos, candidato] }, ctx, {
        tipo: 'trabajador', objetivo: nombre,
        motivo: `Nuevo candidato: ${nombre}, ${nombreOficio(candidato, ctx.catalogo).toLowerCase()} (${ctx.dinero(candidato.sueldo)} por semana)`,
      })
      secretos = {
        ...secretos,
        trabajadores: { ...secretos.trabajadores, [ids[i]]: privado },
        secretos: secreto.trim() ? { ...secretos.secretos, [ids[i]]: secreto.trim() } : secretos.secretos,
      }
    })
    return { banda, secretos }
  }
}

/**
 * A character hires a candidate: it leaves the list and becomes a worker under the same id, so the private part the director prepared
 * is theirs. Everything else (the places by scale, the ledger) is the hiring of `contratar`
 */
export const contratarCandidato = (id: string, actor: Actor | null): OpBanda => (doc, ctx) => {
  const c = doc.banda.candidatos.find((x) => x.id === id)
  if (!c) throw new ErrorBanda('Ese candidato ya no está: puede que lo haya contratado otro personaje.')
  const sinEl: DocBanda = { ...doc, banda: { ...doc.banda, candidatos: doc.banda.candidatos.filter((x) => x.id !== id) } }
  const tras = contratar({ nombre: c.nombre, oficio: c.oficio, oficioNombre: c.oficioNombre, sueldo: c.sueldo, faccion: c.faccion }, actor, null, c.id)(sinEl, ctx)
  // The worker keeps the trait the players saw
  return c.rasgo
    ? { ...tras, banda: { ...tras.banda, trabajadores: tras.banda.trabajadores.map((t) => (t.id === c.id ? { ...t, rasgo: c.rasgo } : t)) } }
    : tras
}

/** The director withdraws a candidate nobody hired: it goes away with its private part and its secret */
export const retirarCandidato = (id: string): OpBanda => (doc, ctx) => {
  const c = doc.banda.candidatos.find((x) => x.id === id)
  if (!c) return doc
  const trabajadores = { ...doc.secretos.trabajadores }
  delete trabajadores[id]
  const secretos = { ...doc.secretos.secretos }
  delete secretos[id]
  return {
    banda: anotar({ ...doc.banda, candidatos: doc.banda.candidatos.filter((x) => x.id !== id) }, ctx, {
      tipo: 'trabajador', objetivo: c.nombre, motivo: `Candidato retirado: ${c.nombre}`,
    }),
    secretos: { ...doc.secretos, trabajadores, secretos },
  }
}
