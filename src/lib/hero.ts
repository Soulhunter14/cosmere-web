import type { CSSProperties } from 'react'

/* Styles for content placed on top of CharacterHero's gemstone gradient (white text is >= 7:1 there). */

/** Text colours on the gemstone gradients (hero headers, character avatars). The only allowed literal colours. */
export const onGem = '#fff'
export const onGemSoft = 'rgba(255,255,255,0.8)'

/** Pill for use on top of the hero gradient */
export const heroPill: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '3px 10px',
  borderRadius: 999,
  background: 'rgba(0,0,0,0.28)',
  border: '1px solid rgba(255,255,255,0.22)',
  color: '#fff',
  fontSize: 12,
  fontWeight: 650,
  whiteSpace: 'nowrap',
  lineHeight: 1.4,
}

/** Secondary/ghost button on top of the hero gradient (add className="ui-btn") */
export const heroButton: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  minHeight: 40,
  padding: '0 14px',
  borderRadius: 12,
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.25)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 650,
  cursor: 'pointer',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
}
