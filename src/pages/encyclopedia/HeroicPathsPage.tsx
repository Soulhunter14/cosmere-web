import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight, RefreshCw, Star, X } from 'lucide-react'
import type { HeroicPath, HeroicPathSpecialty } from '../../data/heroicPaths'
import type { Era } from '../../types'
import { TalentActivation } from '../../components/TalentActivation'
import { HeroicPathIcon } from '../../components/GameIcons'
import { CosmereIcon } from '../../components/CosmereIcon'
import { Button, ErrorMessage, IconButton, PageHeader, SectionTitle, Spinner, Tabs, TabPanel } from '../../components/ui'
import { useDialogA11y } from '../../hooks/useDialogA11y'
import { useEra, useWorldConfig, useWorldData } from '../../store/campaignStore'
import { isAvailable } from '../../worlds'
import type { WorldConfig } from '../../worlds/types'
import { c, eyebrow, font, fs, page, pill, radius, shadow, tint, titleText, tone, toneFrom, type Tone } from '../../theme'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })

// ── Era of the specialties ──
// The six paths are Cosmere; the specialties each world offers come with its data (`WorldData.caminosHeroicos`). A book can restrict a
// specialty to some eras (Nacidos de la bruma tags Inventor and Pistolero «ERA 2», L.73 / PDF 79): the data then carry `eras`, the era of
// the campaign filters them with `isAvailable` and a chip marks them. `WorldData` types its paths with the shared HeroicPath, which has
// no `eras`, so the field is read through this one accessor.
const erasOf = (s: HeroicPathSpecialty): Era[] | undefined => (s as HeroicPathSpecialty & { eras?: Era[] }).eras

/** The path with only the specialties of the era of the campaign (`null` = no era: all of them); the same object if none is left out */
function forEra(path: HeroicPath, era: Era | null): HeroicPath {
  const specialties = path.specialties.filter((s) => isAvailable({ eras: erasOf(s) }, era))
  return specialties.length === path.specialties.length ? path : { ...path, specialties }
}

/** Label and tone (from the world's own era list) of the chip of a specialty that exists in only some of its eras; `null` if it exists in all */
function eraChipOf(s: HeroicPathSpecialty, eras: WorldConfig['eras']): { label: string; tone: Tone } | null {
  const defs = eras?.filter((e) => erasOf(s)?.includes(e.id)) ?? []
  if (!eras || defs.length === 0 || defs.length === eras.length) return null
  return { label: defs.map((e) => e.label).join(' · '), tone: defs.length === 1 ? defs[0].tone : tone.cuarzo }
}

/** Small uppercase tag inside a pill or a tab, like the «ERA 2» tag the book prints on the specialty: the era's tone plus its text */
function EraChip({ label, t }: { label: string; t: Tone }) {
  return (
    <span style={{ ...pill(t), padding: '1px 7px', fontSize: fs.eyebrow, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      {label}
    </span>
  )
}

// ── Local sheet with a hero header (dialog named by the visible title) ──
function HeroSheet({ open, onClose, labelledBy, children, maxWidth = 600 }: {
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

function PathDetail({ path, titleId }: { path: HeroicPath; titleId: string }) {
  const [activeSpecialty, setActiveSpecialty] = useState(0)
  const cfg = useWorldConfig()
  const specialty = path.specialties[activeSpecialty]
  const t = toneFrom(path.color)
  const specPrefix = `spec-${path.id}`
  const attrsId = useId()
  const skillsId = useId()

  return (
    <>
      {/* Hero */}
      <div
        style={{
          padding: '16px 20px 20px',
          background: `linear-gradient(180deg, ${tint(path.color, 18)}, ${tint(path.color, 4)})`,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div aria-hidden className="ui-sheet-handle" style={{ marginTop: -6 }} />
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', paddingRight: 52, paddingTop: 4 }}>
          <span
            aria-hidden
            style={{
              width: 56, height: 56, borderRadius: radius.md, flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: t.bg, border: `1.5px solid ${t.border}`, color: t.fg,
            }}
          >
            <HeroicPathIcon id={path.id} size={28} />
          </span>
          <div style={{ minWidth: 0 }}>
            <h2 id={titleId} style={{ ...titleText, fontSize: fs['2xl'] - 2, color: c.text }}>
              {path.name}
            </h2>
            <span style={{ ...pill(t), marginTop: 8, whiteSpace: 'normal' }}>
              <Star size={12} aria-hidden />
              Habilidad inicial: {path.initialSkill}
            </span>
          </div>
        </div>

        {/* Main talent */}
        <div
          style={{
            marginTop: 18, padding: '14px 16px', borderRadius: radius.md,
            background: 'color-mix(in srgb, var(--surface-1) 72%, transparent)', border: `1px solid ${t.border}`,
          }}
        >
          <p style={{ ...eyebrow, color: t.fg, marginBottom: 6 }}>Talento principal</p>
          <p style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, color: c.text, lineHeight: 1.25, marginBottom: 4 }}>
            {path.mainTalent}
          </p>
          <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.55 }}>
            {path.mainTalentEffect}
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ ...stack(24), padding: '24px 20px 0' }}>
        <section>
          <SectionTitle as="h3">Descripción</SectionTitle>
          <p style={{ fontFamily: font.display, fontSize: fs.md + 1, color: c.muted, lineHeight: 1.6 }}>
            {path.definition}
          </p>
        </section>

        {/* Atributos y habilidades */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 140px', padding: '12px 14px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}>
            <p id={attrsId} style={{ ...eyebrow, marginBottom: 8 }}>Atributos</p>
            <ul aria-labelledby={attrsId} style={{ ...stack(4), listStyle: 'none' }}>
              {path.recommendedAttributes.map((a) => (
                <li key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: fs.sm + 1, color: c.text }}>
                  <CosmereIcon name="ornamento-rombo" size={8} style={{ color: t.fg }} />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: '1.5 1 190px', padding: '12px 14px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}>
            <p id={skillsId} style={{ ...eyebrow, marginBottom: 8 }}>Habilidades clave</p>
            <ul aria-labelledby={skillsId} style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {path.recommendedSkills.map((s) => (
                <li key={s} style={pill(t)}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Especialidades */}
        <section>
          <SectionTitle as="h3">Especialidades</SectionTitle>
          <Tabs
            tabs={path.specialties.map((s, i) => {
              const era = eraChipOf(s, cfg.eras)
              return {
                id: String(i),
                label: era ? <>{s.name}<EraChip label={era.label} t={era.tone} /></> : s.name,
                ariaLabel: era ? `${s.name} (${era.label})` : undefined,
              }
            })}
            value={String(activeSpecialty)}
            onChange={(id) => setActiveSpecialty(Number(id))}
            ariaLabel="Especialidades"
            idPrefix={specPrefix}
            stretch
            size="sm"
            style={{ marginBottom: 14 }}
          />

          <TabPanel idPrefix={specPrefix} id={String(activeSpecialty)} style={stack(8)}>
            <p
              style={{
                fontSize: fs.base - 1, color: c.muted, lineHeight: 1.55, padding: '12px 14px', borderRadius: radius.md,
                background: t.bg, border: `1px solid ${t.border}`, marginBottom: 4,
              }}
            >
              {specialty.description}
            </p>

            {specialty.talentos.map((tal) => (
              <article
                key={tal.name}
                style={{ padding: '12px 14px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <TalentActivation type={tal.activation} compact />
                  <h4 style={{ fontFamily: font.ui, fontSize: fs.base - 1, fontWeight: 650, color: c.text, lineHeight: 1.3 }}>{tal.name}</h4>
                </div>
                <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.55 }}>{tal.description}</p>
              </article>
            ))}
          </TabPanel>
        </section>
      </div>
    </>
  )
}

function PathCard({ path, onClick }: { path: HeroicPath; onClick: () => void }) {
  const t = toneFrom(path.color)
  const cfg = useWorldConfig()

  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className="ui-card ui-card--interactive"
      style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 14px 14px 16px', minHeight: 84, textAlign: 'left', cursor: 'pointer',
        background: c.s1, border: `1px solid ${c.border}`, borderRadius: radius.lg, boxShadow: shadow[1],
        color: c.text, font: 'inherit',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 48, height: 48, borderRadius: radius.md, flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
        }}
      >
        <HeroicPathIcon id={path.id} size={24} />
      </span>

      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2, color: c.text }}>
          {path.name}
        </span>
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {path.specialties.map((s) => {
            const era = eraChipOf(s, cfg.eras)
            return (
              <span key={s.name} style={pill(t)}>
                {s.name}
                {era && <EraChip label={era.label} t={era.tone} />}
              </span>
            )
          })}
        </span>
      </span>

      <ChevronRight size={18} aria-hidden style={{ color: c.subtle }} />
    </button>
  )
}

export function HeroicPathsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const sheetTitleId = useId()
  const cfg = useWorldConfig()
  const era = useEra()
  const { data, isPending } = useWorldData()
  const header = (
    <PageHeader
      title="Caminos Heroicos"
      subtitle={`Los seis caminos que definen las competencias mundanas de cada héroe en ${cfg.planeta}`}
    />
  )

  // Stormlight never waits (its WorldData is `initialData`); the paths of another world come with its lazy chunk
  if (isPending) {
    return (
      <div style={page}>
        {header}
        <Spinner />
      </div>
    )
  }
  // The chunk did not load: never show another world's paths in its place. A failed `import()` stays failed for the rest of the
  // document (the browser keeps the failure), so a `refetch()` could not recover it: only reloading the page does
  if (!data) {
    return (
      <div style={page}>
        {header}
        <ErrorMessage message="No se pudieron cargar los caminos heroicos." style={{ marginBottom: 16 }} />
        <Button onClick={() => window.location.reload()} icon={<RefreshCw size={15} aria-hidden />}>
          Recargar la página
        </Button>
      </div>
    )
  }

  const caminos = data.caminosHeroicos.map((path) => forEra(path, era))
  const selected = caminos.find((path) => path.id === selectedId) ?? null

  return (
    <div style={page}>
      {header}

      <ul
        aria-label="Caminos heroicos"
        style={{
          listStyle: 'none', display: 'grid', gap: 10,
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))',
        }}
      >
        {caminos.map((path, i) => (
          <li key={path.id} className="rise" style={{ '--i': i } as CSSProperties}>
            <PathCard path={path} onClick={() => setSelectedId(path.id)} />
          </li>
        ))}
      </ul>

      <HeroSheet open={!!selected} onClose={() => setSelectedId(null)} labelledBy={sheetTitleId}>
        {/* key: the specialty tab resets to the first one for every path, as before */}
        {selected && <PathDetail key={selected.id} path={selected} titleId={sheetTitleId} />}
      </HeroSheet>
    </div>
  )
}
