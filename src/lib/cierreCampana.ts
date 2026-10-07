/**
 * Closing of the campaign: while it is being prepared (session 0) players fill in their character freely; once the director starts it,
 * the fields the server lists in `camposDeCierre` (`CierreCampana.Campos` in the API) are locked for players. The director always edits
 * them and can reopen the preparation. Shared by every world: a field a world does not use (the legacy in Stormlight) is left out of the
 * texts through its feature.
 */
import type { Character } from '../types'
import type { WorldConfig } from '../worlds/types'

/** Visible name of each lockable field and the world feature it needs, if any */
const CAMPOS: Partial<Record<keyof Character, { nombre: string; feature?: keyof WorldConfig['features'] }>> = {
  proposito: { nombre: 'propósito' },
  obstaculo: { nombre: 'obstáculo' },
  legado: { nombre: 'legado', feature: 'legados' },
  legadoRespuestas: { nombre: 'respuestas del legado', feature: 'legados' },
}

/** Names of the lockable fields that this world uses, in the order of the server's list */
export function nombresCamposDeCierre(campos: readonly string[], cfg: WorldConfig): string[] {
  return campos.flatMap((campo) => {
    const def = CAMPOS[campo as keyof Character]
    if (!def) return []
    return def.feature && !cfg.features[def.feature] ? [] : [def.nombre]
  })
}

/** «a, b y c» */
export const enumerar = (xs: string[]): string =>
  xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`

export const AVISO_CERRADO = 'Cerrado al iniciar la campaña'
