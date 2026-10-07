/**
 * JSX helpers of the Stormlight world config. They live in a .tsx apart from stormlight.ts because a .ts file
 * cannot hold JSX. They are plain functions, not components: they only build the elements that WorldConfig
 * asks for as `(size) => ReactNode`.
 */
import type { ReactNode } from 'react'
import { AudioWaveform, UserRound } from 'lucide-react'
import { RadiantOrderIcon } from '../components/RadiantOrderIcon'

/** Same icons the ancestry pickers and pills use today (CharacterDetailPage.tsx `ASCENDENCIAS`) */
export const iconoHumano = (size: number): ReactNode => <UserRound size={size} />
export const iconoOyente = (size: number): ReactNode => <AudioWaveform size={size} />

/** The official order glyph from the rulebook (a vector, not a Lucide icon); the order name is shown next to it, so it is decorative */
export const iconoOrden = (id: string, size: number): ReactNode => <RadiantOrderIcon orderId={id} size={size} decorative />
