import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useImagenLibro } from '../lib/fichasLibro'

/**
 * The adversary's illustration from its book as an avatar (covering the box, faces at the top). It asks for the image only once
 * the avatar comes on screen, so a long list of adversaries never loads every portrait at once; until then, or if it fails, it
 * shows `children` (the initial).
 */
export function RetratoAvatar({ cId, npcId, estilo, children }: { cId: number; npcId: number; estilo: CSSProperties; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    const obs = new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.isIntersecting)) setVisible(true)
    }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [visible])
  const { data: url } = useImagenLibro(cId, npcId, 'retrato', visible)
  return (
    <span ref={ref} aria-hidden style={estilo}>
      {url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} /> : children}
    </span>
  )
}
