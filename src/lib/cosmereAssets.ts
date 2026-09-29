/* Registry of the official Cosmere assets in src/assets/cosmere (see components/CosmereIcon.tsx). */
const RAW = import.meta.glob('../assets/cosmere/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const MASKS = import.meta.glob('../assets/cosmere/mask/*.png', { query: '?url', import: 'default', eager: true }) as Record<string, string>

const baseName = (path: string) => path.split('/').pop()!.replace(/\.(svg|png)$/, '')

export interface VectorIcon { kind: 'svg'; html: string; ratio: number }
export interface MaskIcon { kind: 'mask'; url: string; ratio: number }

export const ICONS: Record<string, VectorIcon | MaskIcon> = {}

for (const [path, svg] of Object.entries(RAW)) {
  const vb = /viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)"/.exec(svg)
  const ratio = vb ? Number(vb[1]) / Number(vb[2]) : 1
  ICONS[baseName(path)] = {
    kind: 'svg',
    ratio,
    html: svg.replace('<svg ', '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" focusable="false" aria-hidden="true" '),
  }
}
for (const [path, url] of Object.entries(MASKS)) {
  const m = /__(\d+)x(\d+)$/.exec(baseName(path))
  const name = baseName(path).replace(/__\d+x\d+$/, '')
  if (!ICONS[name]) ICONS[name] = { kind: 'mask', url, ratio: m ? Number(m[1]) / Number(m[2]) : 1 }
}

export function hasCosmereIcon(name: string | null | undefined): boolean {
  return !!name && name in ICONS
}

export const COSMERE_ICON_NAMES = Object.keys(ICONS).sort()

/* ─── Official full-colour illustrations (spheres, dice) ─── */
const IMAGES = import.meta.glob('../assets/cosmere/img/*.webp', { query: '?url', import: 'default', eager: true }) as Record<string, string>
const IMAGE_URLS: Record<string, string> = Object.fromEntries(Object.entries(IMAGES).map(([p, url]) => [baseName(p).replace(/\.webp$/, ''), url]))

/** URL of an official illustration: 'dado-d20', 'dado-trama', 'esfera-chip-zafiro', 'esfera-marco-diamante', 'esfera-broam-esmeralda', 'esferas-fila' */
export function cosmereImage(name: string): string | undefined {
  return IMAGE_URLS[name]
}
