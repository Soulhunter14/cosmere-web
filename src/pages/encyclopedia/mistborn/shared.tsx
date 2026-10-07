/**
 * Building blocks shared by the lazy encyclopedia pages of Nacidos de la bruma (OrigenesPage, CaminosMetalPage and, since T24b,
 * ArtesMetalicasPage and PoderMetalPage). Components only, so fast refresh keeps working (react-refresh/only-export-components).
 * They follow the look of RadiantOrdersPage and PotenciasPage and read the world through `useWorldConfig()` and `useEra()`, never
 * by world id (P8).
 */
import { useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams, type LinkProps } from 'react-router-dom'
import { BookOpen, ChevronDown, Pin, TriangleAlert, X } from 'lucide-react'
import type { Era } from '../../../types'
import type { Talento } from '../../../data/potencias'
import { getMetal, type ArteMetal, type MetalId } from '../../../data/mistborn/metales'
import { MetalGlyph } from '../../../components/mistborn/MetalGlyph'
import { TalentActivation } from '../../../components/TalentActivation'
import { IconButton } from '../../../components/ui'
import { useDialogA11y } from '../../../hooks/useDialogA11y'
import { useEra, useWorldConfig } from '../../../store/campaignStore'
import { isAvailable } from '../../../worlds'
import { c, eyebrow, font, fs, pill, radius, tone, toneFrom, type Tone } from '../../../theme'

// ── Sheet with a hero header (the dialog is named by the visible title) ──
export function HeroSheet({ open, onClose, labelledBy, children, maxWidth = 600 }: {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: ReactNode
  maxWidth?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useDialogA11y(ref, open, onClose)
  if (!open) return null
  return createPortal(
    <div className="ui-sheet-wrap">
      <div
        className="fade-in"
        onClick={onClose}
        aria-hidden
        style={{ position: 'absolute', inset: 0, background: c.overlay, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="ui-sheet"
        style={{ maxWidth, overflow: 'hidden' }}
      >
        <IconButton
          label="Cerrar"
          variant="surface"
          size={44}
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, zIndex: 1, borderRadius: radius.full }}
        >
          <X size={18} aria-hidden />
        </IconButton>
        {/* Focusable scroller: keyboard users can scroll a sheet that has no controls of its own */}
        <div
          role="region"
          aria-labelledby={labelledBy}
          tabIndex={0}
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 'calc(24px + var(--sab))', outlineOffset: -3 }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ── Talent row: header button + sibling panel (h4 by default: it lives under an h3 section; `headingLevel` 3 under an h2 one) ──
export function TalentoRow({ talento, concedido = false, headingLevel = 4 }: { talento: Talento; concedido?: boolean; headingLevel?: 3 | 4 }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const H = headingLevel === 3 ? 'h3' : 'h4'

  return (
    <div
      style={{
        borderRadius: radius.md,
        background: c.s2,
        border: `1px solid ${open ? c.borderBright : c.border}`,
        transition: 'border-color var(--dur-2)',
      }}
    >
      <H style={{ margin: 0, fontFamily: font.ui, fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 0 }}>
        <button
          type="button"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen(!open)}
          className="ui-row"
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, minHeight: 48,
            padding: '10px 12px', background: 'none', border: 'none', borderRadius: radius.md,
            cursor: 'pointer', textAlign: 'left', color: c.text,
          }}
        >
          <TalentActivation type={talento.cost} compact />
          <span style={{ flex: 1, minWidth: 0, fontSize: fs.base - 1, fontWeight: 650, lineHeight: 1.3 }}>{talento.name}</span>
          {concedido && <span style={{ ...pill(tone.cuarzo), fontSize: fs.eyebrow, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Concedido</span>}
          <ChevronDown
            size={16}
            aria-hidden
            style={{ color: c.subtle, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-2) var(--ease-out)' }}
          />
        </button>
      </H>
      {open && (
        <div id={`${id}-panel`} className="fade-in" style={{ padding: '0 12px 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
            {talento.prereq && (
              <p style={{ fontSize: fs.sm, color: c.subtle, fontStyle: 'italic' }}>Prerrequisito: {talento.prereq}</p>
            )}
            <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6 }}>{talento.description}</p>
            {talento.notaLibro && <NotaLibro texto={talento.notaLibro} />}
          </div>
        </div>
      )}
    </div>
  )
}

// The `[inferido…]` marks inside the data texts are notes for the maintainers, not for the table: they are not shown
const MARCAS_INFERIDO = /\s*\[inferido[^\]]*\]/g

// ── Erratum or discrepancy of the book (same box as the talent sheet) ──
export function NotaLibro({ texto }: { texto: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: radius.sm, background: tone.zafiro.bg, border: `1px solid ${tone.zafiro.border}` }}>
      <BookOpen size={17} aria-hidden style={{ color: tone.zafiro.fg, flexShrink: 0, marginTop: 1 }} />
      <div>
        <p style={{ ...eyebrow, color: tone.zafiro.fg }}>Nota del libro</p>
        <p style={{ fontSize: fs.sm, color: c.text, lineHeight: 1.5, marginTop: 2 }}>{texto.replace(MARCAS_INFERIDO, '')}</p>
      </div>
    </div>
  )
}

// ── Label + value rows in one panel ──
export function InfoList({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl style={{ borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`, overflow: 'hidden' }}>
      {rows.map((r, i) => (
        <div key={r.label} style={{ padding: '12px 14px', borderTop: i === 0 ? 'none' : `1px solid ${c.border}` }}>
          <dt style={{ ...eyebrow, marginBottom: 4 }}>{r.label}</dt>
          <dd style={{ fontSize: fs.base - 1, color: c.text, lineHeight: 1.55 }}>{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

// ── Neutral note block (the look of PotenciasPage's note, without the surge glyph) ──
export function Note({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        padding: '14px 16px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`,
        fontSize: fs.sm + 1, color: c.muted, lineHeight: 1.55,
      }}
    >
      {children}
    </p>
  )
}

// ── Era chips: «Era 1», «Era 2» or «Ambas eras», with the label and tone declared by the world (WorldConfig.eras) ──
export function EraChips({ eras }: { eras: Era[] }) {
  const defs = useWorldConfig().eras ?? []
  const all = defs.length > 0 && defs.every((d) => eras.includes(d.id))
  if (all) return <span style={pill(tone.cuarzo)}>{defs.length === 2 ? 'Ambas eras' : 'Todas las eras'}</span>
  return (
    <>
      {defs.filter((d) => eras.includes(d.id)).map((d) => (
        <span key={d.id} style={pill(d.tone)}>{d.label}</span>
      ))}
    </>
  )
}

// ── Warns when an option does not exist in the era of the campaign (the era only filters options, §3 b) ──
export function EraNotice({ eras }: { eras: Era[] }) {
  const era = useEra()
  const defs = useWorldConfig().eras ?? []
  if (isAvailable({ eras }, era)) return null
  const label = defs.find((d) => d.id === era)?.label ?? 'tu era'
  const t: Tone = tone.topacio
  return (
    <p
      role="note"
      style={{
        display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', borderRadius: radius.sm,
        background: t.bg, border: `1px solid ${t.border}`, fontSize: fs.sm, color: c.text, lineHeight: 1.5,
      }}
    >
      <TriangleAlert size={17} aria-hidden style={{ color: t.fg, flexShrink: 0, marginTop: 1 }} />
      <span>No existe en la era de tu campaña ({label}); consúltalo como referencia.</span>
    </p>
  )
}

// ── Tile of a metal: its official glyph (MetalGlyph, T46) in the era of the campaign, tinted with the colour of the metal (a data colour:
// toneFrom). `size` is the nominal size of the icon: the glyph is drawn a quarter bigger, because its artwork leaves a margin inside its square
// box. Hemalurgy has no glyph (a spike is not a letter of either alphabet, L.405 / PDF 411): its tile keeps the Lucide spike ──
export function GlifoMetal({ metal, arte, size = 22 }: { metal: MetalId; arte: ArteMetal | 'hemalurgia'; size?: number }) {
  const t = toneFrom(getMetal(metal).color)
  const box = Math.round(size * 1.9)
  return (
    <span
      aria-hidden
      style={{
        width: box, height: box, borderRadius: radius.md, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
      }}
    >
      {arte === 'hemalurgia' ? <Pin size={size} /> : <MetalGlyph metal={metal} arte={arte} size={Math.round(size * 1.25)} />}
    </span>
  )
}

// ── Links inside the «Artes metálicas» section: the route shape lives here only (App.tsx: encyclopedia/artes-metalicas[/:arte/:metal]) ──
const rutaArtes = (campaignId: string | undefined) => `/campaigns/${campaignId}/encyclopedia/artes-metalicas`

/** Link to the page of one power: Alomancia or Feruquimia of a metal */
export function LinkPoder({ arte, metal, ...rest }: { arte: ArteMetal; metal: MetalId } & Omit<LinkProps, 'to'>) {
  const { campaignId } = useParams()
  return <Link to={`${rutaArtes(campaignId)}/${arte}/${metal}`} {...rest} />
}

/** Link to the index of the metallic arts; `arte` leaves its tab selected (the index reads it from the `?arte=` parameter) */
export function LinkArtes({ arte, ...rest }: { arte?: ArteMetal | 'hemalurgia' } & Omit<LinkProps, 'to'>) {
  const { campaignId } = useParams()
  return <Link to={arte ? `${rutaArtes(campaignId)}?arte=${arte}` : rutaArtes(campaignId)} {...rest} />
}
