import { tone, type Tone } from '../../theme'
import { COLORES_FICHA, type FichaMesa } from './publica'

/** Gem tones of the characters' tokens (`FichaMesa.color` indexes it; `COLORES_FICHA` entries); enemies are always ruby */
const PALETA: Tone[] = [tone.brand, tone.esmeralda, tone.zafiro, tone.amatista, tone.heliodoro, tone.topacio]

export const tonoDeFicha = (f: Pick<FichaMesa, 'bando' | 'color'>): Tone => (f.bando === 'pnj' ? tone.rubi : PALETA[f.color % COLORES_FICHA] ?? tone.brand)
