/**
 * Conditions («estados») of the Cosmere engine: the ones both rulebooks share. Each world adds its own in its configuration
 * (`WorldConfig.estados`): Stormlight «Empoderado» (Puente Nueve, conditions table), Mistborn «Desprovisto» and «Mermado»
 * (L.310-311 / PDF 316-317). The «Pantalla del director» applies them to the combatants of an encounter.
 * `resumen` is a short paraphrase for the director, never a quotation of the book.
 */
import type { EstadoDef } from './types'

export const ESTADOS_COSMERE: EstadoDef[] = [
  { id: 'afligido', nombre: 'Afligido', resumen: 'Sufre el daño indicado al final de cada uno de sus turnos.', valor: 'Daño, p. ej. 2d10 vital' },
  { id: 'agotado', nombre: 'Agotado', resumen: 'Resta la penalización a sus pruebas. Se acumula; baja 1 tras cada descanso largo.', valor: 'Penalización, p. ej. −2' },
  { id: 'aturdido', nombre: 'Aturdido', resumen: 'Sin reacciones y con dos acciones menos en su turno.' },
  { id: 'concentrado', nombre: 'Concentrado', resumen: 'Las capacidades que cuestan concentración le cuestan 1 menos.' },
  { id: 'desorientado', nombre: 'Desorientado', resumen: 'Sin reacciones; sus sentidos están ofuscados (desventaja en Percepción).' },
  { id: 'inconsciente', nombre: 'Inconsciente', resumen: 'Movimiento 0, queda Tumbado y suelta lo que sostiene; no actúa ni percibe.' },
  { id: 'inmovilizado', nombre: 'Inmovilizado', resumen: 'Movimiento 0; no puede moverse ni ser desplazado.' },
  { id: 'mejorado', nombre: 'Mejorado', resumen: 'Un atributo sube lo indicado; no cambia defensas ni máximos. Se acumula.', valor: 'Atributo, p. ej. Velocidad +2' },
  { id: 'ralentizado', nombre: 'Ralentizado', resumen: 'Su movimiento se reduce a la mitad.' },
  { id: 'resuelto', nombre: 'Resuelto', resumen: 'Al fallar una prueba puede añadir una Oportunidad; después se elimina.' },
  { id: 'retenido', nombre: 'Retenido', resumen: 'Movimiento 0 y desventaja en todo salvo en liberarse.' },
  { id: 'sorprendido', nombre: 'Sorprendido', resumen: 'Sin reacciones, no puede jugar un turno rápido y tiene una acción menos.' },
  { id: 'tumbado', nombre: 'Tumbado', resumen: 'Está Ralentizado y los ataques cuerpo a cuerpo contra él tienen ventaja.' },
]

/** The shared conditions plus the world's own, in alphabetical order (the order of the book's tables) */
export const conEstadosDelMundo = (propios: EstadoDef[]): EstadoDef[] =>
  [...ESTADOS_COSMERE, ...propios].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
