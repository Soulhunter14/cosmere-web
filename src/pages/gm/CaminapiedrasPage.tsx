import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
  BookOpen, Swords, Compass, MessageCircle, GitFork,
  MapIcon, ChevronLeft, ChevronRight, Users, Shield, Star, Heart,
  Zap, Info, MapPin, Maximize2, ExternalLink, Clock,
  type LucideIcon,
} from 'lucide-react'
import { CHAPTERS, type AdventureChapter, type Scene, type Npc, type Combat, type AdventureMap, type SceneType, type NpcRole, type SceneTable } from '../../data/caminapiedras'
import { Button, Disclosure, SectionTitle, Sheet, TabPanel, Tabs } from '../../components/ui'
import { CosmereIcon } from '../../components/CosmereIcon'
import { PlotIcon } from '../../components/GameIcons'
import { buttonReset, c, eyebrow, font, fs, page, pill, radius, shadow, titleText, tone, type Tone } from '../../theme'

// ── Helpers ───────────────────────────────────────────────────

const SCENE_META: Record<SceneType, { label: string; tone: Tone; icon: LucideIcon }> = {
  narrative: { label: 'Narrativa', tone: tone.amatista, icon: BookOpen },
  social: { label: 'Social', tone: tone.zafiro, icon: MessageCircle },
  exploration: { label: 'Exploración', tone: tone.esmeralda, icon: Compass },
  combat: { label: 'Combate', tone: tone.rubi, icon: Swords },
  choice: { label: 'Decisión', tone: tone.topacio, icon: GitFork },
}

function SceneIcon({ type, size = 14 }: { type: SceneType; size?: number }) {
  const { icon: Icon, tone: t } = SCENE_META[type]
  return <Icon size={size} aria-hidden style={{ color: t.fg }} />
}

const NPC_ROLE_LABEL: Record<NpcRole, string> = {
  ally: 'Aliado', neutral: 'Neutral', villain: 'Antagonista', special: 'Especial',
}
const NPC_ROLE_META: Record<NpcRole, { tone: Tone; icon: LucideIcon }> = {
  ally: { tone: tone.esmeralda, icon: Heart },
  neutral: { tone: tone.cuarzo, icon: Users },
  villain: { tone: tone.rubi, icon: Shield },
  special: { tone: tone.topacio, icon: Star },
}

function NpcRoleIcon({ role, size = 14 }: { role: NpcRole; size?: number }) {
  const { icon: Icon, tone: t } = NPC_ROLE_META[role]
  return <Icon size={size} aria-hidden style={{ color: t.fg }} />
}

/** Adventure / chapter identity: the book's gold (chapter ornaments) */
const CHAPTER = tone.gold

const PROGRESSION_META: Record<'key' | 'spren' | 'info', { label: string; tone: Tone; icon: LucideIcon }> = {
  key: { label: 'Clave', tone: tone.topacio, icon: Zap },
  spren: { label: 'Spren', tone: tone.amatista, icon: Star },
  info: { label: 'Información', tone: tone.cuarzo, icon: Info },
}

const bodyText: CSSProperties = { fontSize: fs.sm + 1, color: c.text, lineHeight: 1.55 }
const proseText: CSSProperties = { fontFamily: font.display, fontSize: fs.lg - 1, color: c.text, lineHeight: 1.6 }
const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 }
const riseIndex = (i: number) => ({ '--i': Math.min(i, 12) }) as CSSProperties

/** Small uppercase heading inside cards (h3 under a scene, h4 under NPC/combat/map cards) */
function Kicker({
  as: Tag = 'h3',
  color = c.subtle,
  icon,
  children,
  style,
}: {
  as?: 'h3' | 'h4' | 'p'
  color?: string
  icon?: ReactNode
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <Tag style={{ ...eyebrow, fontFamily: font.ui, lineHeight: 1.4, color, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, ...style }}>
      {icon && <span aria-hidden style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </Tag>
  )
}

/** Tinted square that carries a card's icon */
function IconTile({ t, children, size = 40 }: { t: Tone; children: ReactNode; size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, flexShrink: 0, borderRadius: radius.sm + 2,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
      }}
    >
      {children}
    </span>
  )
}

/** List with the book's gold lozenge as bullet */
function LozengeList({ items, color = c.goldOrnament }: { items: string[]; color?: string }) {
  return (
    <ul style={{ ...listReset, ...stack(8) }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span aria-hidden style={{ display: 'flex', color, paddingTop: 7 }}>
            <CosmereIcon name="ornamento-rombo" size={8} square />
          </span>
          <span style={bodyText}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** "Nv. 1→2" with the arrow hidden from screen readers */
function LevelRange({ from, to }: { from: number; to: number }) {
  return (
    <span>
      Nv. {from}<span aria-hidden>→</span><span className="sr-only"> a </span>{to}
    </span>
  )
}

/** Tinted callout box */
function Callout({ t, children, style }: { t: Tone; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ padding: '12px 14px', borderRadius: radius.md, background: t.bg, border: `1px solid ${t.border}`, ...style }}>
      {children}
    </div>
  )
}

/** Roll table: a real <table>; the roll is the row header. Plot results use the official plot-die symbols. Also read by the «Pantalla del director» */
export function RollTable({ table, t }: { table: SceneTable; t: Tone }) {
  const hasRoll = table.entries.some((e) => e.roll)
  const cell: CSSProperties = { padding: '10px 12px', verticalAlign: 'top', textAlign: 'left' }
  return (
    <div style={{ borderRadius: radius.md, border: `1px solid ${c.border}`, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <caption
          style={{
            ...eyebrow, color: t.fg, textAlign: 'left', captionSide: 'top',
            padding: '9px 12px', background: t.bg, borderBottom: `1px solid ${t.border}`, lineHeight: 1.4,
          }}
        >
          {table.title}
        </caption>
        <tbody>
          {table.entries.map((e, ei) => {
            const plot = e.roll === 'Oportunidad' ? 'oportunidad' : e.roll === 'Complicación' ? 'complicacion' : null
            return (
              <tr key={ei} style={{ background: ei % 2 === 0 ? c.s2 : 'transparent', borderTop: ei > 0 ? `1px solid ${c.border}` : undefined }}>
                {hasRoll && (e.roll ? (
                  <th
                    scope="row"
                    style={{
                      ...cell, width: '1%', whiteSpace: 'nowrap',
                      fontSize: fs.sm, fontWeight: 700, fontVariantNumeric: 'tabular-nums lining-nums',
                      color: plot === 'oportunidad' ? c.brand : plot === 'complicacion' ? tone.rubi.fg : t.fg,
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {plot && <PlotIcon result={plot} size={14} />}
                      {e.roll}
                    </span>
                  </th>
                ) : (
                  <td style={cell} />
                ))}
                <td style={{ ...cell, ...bodyText }}>{e.text}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Scene card ────────────────────────────────────────────────
function SceneCard({ scene }: { scene: Scene }) {
  const meta = SCENE_META[scene.type]

  return (
    <Disclosure
      headingLevel={2}
      accent={meta.tone.fg}
      icon={<IconTile t={meta.tone}><SceneIcon type={scene.type} size={18} /></IconTile>}
      title={scene.title}
      summary={
        <span style={{ display: 'flex', marginTop: 6 }}>
          <span style={pill(meta.tone)}>{meta.label}</span>
        </span>
      }
    >
      <div style={stack(18)}>
        {/* Read aloud */}
        {scene.readAloud && (
          <div
            style={{
              display: 'flex', gap: 14, padding: '14px 16px 16px 12px', borderRadius: radius.md,
              background: CHAPTER.bg, border: `1px solid ${CHAPTER.border}`,
            }}
          >
            <span aria-hidden style={{ display: 'flex', color: c.goldOrnament, paddingTop: 2 }}>
              <CosmereIcon name="ornamento-cita" size={52} />
            </span>
            <div style={{ minWidth: 0 }}>
              <Kicker color={CHAPTER.fg}>Leer en voz alta</Kicker>
              {scene.readAloud.split('\n\n').map((p, i) => (
                <p key={i} style={{ ...proseText, fontStyle: 'italic', margin: i > 0 ? '10px 0 0' : 0 }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {scene.content.length > 0 && (
          <div style={stack(10)}>
            {scene.content.map((p, i) => (
              <p key={i} style={{ fontSize: fs.base, color: c.text, lineHeight: 1.6 }}>{p}</p>
            ))}
          </div>
        )}

        {/* Branches */}
        {scene.branches && scene.branches.length > 0 && (
          <section>
            <Kicker color={tone.topacio.fg} icon={<GitFork size={14} />}>Caminos posibles</Kicker>
            <ul style={{ ...listReset, ...stack(8) }}>
              {scene.branches.map((b, i) => (
                <li key={i}>
                  <Callout t={tone.topacio}>
                    <p style={{ fontSize: fs.base, fontWeight: 650, color: tone.topacio.fg, marginBottom: 4 }}>{b.label}</p>
                    <p style={bodyText}>{b.description}</p>
                  </Callout>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* DM tips */}
        {scene.tips && scene.tips.length > 0 && (
          <section>
            <Kicker>Notas para la DJ</Kicker>
            <LozengeList items={scene.tips} />
          </section>
        )}

        {/* Tables */}
        {scene.tables && scene.tables.map((table, ti) => (
          <RollTable key={ti} table={table} t={CHAPTER} />
        ))}
      </div>
    </Disclosure>
  )
}

// ── NPC card ──────────────────────────────────────────────────
function NpcCard({ npc }: { npc: Npc }) {
  const role = NPC_ROLE_META[npc.role]
  const RoleIcon = role.icon
  const tile: CSSProperties = { padding: '10px 12px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }
  const dt: CSSProperties = { ...eyebrow, marginBottom: 4 }

  return (
    <Disclosure
      headingLevel={3}
      accent={role.tone.fg}
      icon={<IconTile t={role.tone}><RoleIcon size={18} aria-hidden /></IconTile>}
      title={
        <span style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '2px 8px' }}>
          <span style={{ ...titleText, fontSize: fs.md }}>{npc.name}</span>
          <span style={{ fontFamily: font.ui, fontSize: fs.xs, fontWeight: 500, color: c.subtle }}>{npc.pronouns}</span>
        </span>
      }
      summary={
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          <span style={pill(role.tone)}>{NPC_ROLE_LABEL[npc.role]}</span>
          <span style={pill(tone.cuarzo)}>{npc.type}</span>
        </span>
      }
    >
      <div style={stack(12)}>
        {/* Traits */}
        {npc.traits.length > 0 && (
          <ul aria-label="Rasgos" style={{ ...listReset, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {npc.traits.map((t) => (
              <li key={t} style={{ ...pill(tone.cuarzo), background: c.s2, border: `1px solid ${c.border}`, color: c.muted }}>{t}</li>
            ))}
          </ul>
        )}

        <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
          {/* Goal */}
          <div style={tile}>
            <dt style={dt}>Meta</dt>
            <dd style={bodyText}>{npc.goal}</dd>
          </div>

          {/* Appearance */}
          <div style={tile}>
            <dt style={dt}>Aspecto</dt>
            <dd style={bodyText}>{npc.appearance}</dd>
          </div>

          {/* Notes */}
          {npc.notes && (
            <div style={{ ...tile, gridColumn: '1 / -1', background: CHAPTER.bg, border: `1px solid ${CHAPTER.border}` }}>
              <dt style={{ ...dt, color: CHAPTER.fg }}>Notas DJ</dt>
              <dd style={bodyText}>{npc.notes}</dd>
            </div>
          )}
        </dl>
      </div>
    </Disclosure>
  )
}

// ── Combat card ───────────────────────────────────────────────
function CombatCard({ combat }: { combat: Combat }) {
  return (
    <Disclosure
      headingLevel={3}
      accent={tone.rubi.fg}
      icon={<IconTile t={tone.rubi}><Swords size={18} aria-hidden /></IconTile>}
      title={combat.title}
      summary={
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
          {combat.enemies.map((e, i) => (
            <span key={i} style={{ ...pill(tone.rubi), whiteSpace: 'normal', borderRadius: radius.sm }}>
              {e.count} {e.name}
            </span>
          ))}
          {combat.mapRef && (
            <span style={pill(tone.cuarzo)}>
              <MapIcon size={12} aria-hidden />
              Mapa {combat.mapRef}
            </span>
          )}
        </span>
      }
    >
      <div style={stack(16)}>
        {combat.duration && (
          <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.sm, color: c.muted, fontStyle: 'italic' }}>
            <Clock size={14} aria-hidden style={{ flexShrink: 0 }} />
            Duración: {combat.duration}
          </p>
        )}

        <section>
          <Kicker as="h4">Reglas especiales</Kicker>
          <LozengeList items={combat.specialRules} color={tone.rubi.fg} />
        </section>

        {combat.rewards && (
          <Callout t={tone.esmeralda}>
            <Kicker as="h4" color={tone.esmeralda.fg} style={{ marginBottom: 4 }}>Recompensas</Kicker>
            <p style={bodyText}>{combat.rewards}</p>
          </Callout>
        )}

        {combat.tables && combat.tables.map((table, ti) => (
          <RollTable key={ti} table={table} t={tone.rubi} />
        ))}
      </div>
    </Disclosure>
  )
}

// ── Map card ──────────────────────────────────────────────────
const linkButton: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  minHeight: 44, padding: '0 16px', borderRadius: radius.md,
  background: c.s2, color: c.text, border: `1px solid ${c.borderBright}`,
  fontSize: fs.base - 1, fontWeight: 650, textDecoration: 'none', whiteSpace: 'nowrap',
}

function MapCard({ map }: { map: AdventureMap }) {
  const [zoomed, setZoomed] = useState(false)
  const alt = `Mapa ${map.id}: ${map.title}`

  return (
    <Disclosure
      headingLevel={3}
      accent={tone.zafiro.fg}
      icon={<IconTile t={tone.zafiro}><MapIcon size={18} aria-hidden /></IconTile>}
      title={<>Mapa {map.id}: {map.title}</>}
      summary={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
          <span>{map.scale}</span>
          {map.pdfPage && (
            <span style={pill(tone.zafiro)}>pág. {map.pdfPage}</span>
          )}
        </span>
      }
    >
      <div style={stack(16)}>
        {/* Map image: opens full size */}
        {map.imagePath && (
          <>
            <button
              type="button"
              onClick={() => setZoomed(true)}
              aria-haspopup="dialog"
              aria-label={`Ampliar ${alt}`}
              style={{
                ...buttonReset, position: 'relative', display: 'block', width: '100%',
                borderRadius: radius.md, overflow: 'hidden', border: `1px solid ${tone.zafiro.border}`,
                background: c.s2, cursor: 'zoom-in',
              }}
            >
              <img src={map.imagePath} alt={alt} loading="lazy" decoding="async" style={{ width: '100%', height: 'auto', display: 'block' }} />
              <span
                aria-hidden
                style={{
                  position: 'absolute', right: 8, bottom: 8,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px', borderRadius: radius.full,
                  background: 'color-mix(in srgb, var(--surface-1) 88%, transparent)',
                  border: `1px solid ${c.borderBright}`, color: c.text, boxShadow: shadow[2],
                  fontSize: fs.xs, fontWeight: 650,
                }}
              >
                <Maximize2 size={14} />
                Ampliar
              </span>
            </button>
            <Sheet
              open={zoomed}
              onClose={() => setZoomed(false)}
              title={alt}
              maxWidth={1100}
              footer={
                <>
                  <a href={map.imagePath} target="_blank" rel="noopener noreferrer" className="ui-btn ui-btn--secondary" style={{ ...linkButton, flex: '1 1 auto' }}>
                    <ExternalLink size={16} aria-hidden />
                    Abrir en pestaña nueva
                  </a>
                  <Button variant="primary" onClick={() => setZoomed(false)} style={{ flex: '0 0 auto' }}>Cerrar</Button>
                </>
              }
            >
              {/* Focusable so keyboard users can scroll the full page of the book with the arrow keys */}
              <div role="group" tabIndex={0} aria-label={`${alt}. Desplázate para ver la página completa`} style={{ borderRadius: radius.md }}>
                <img src={map.imagePath} alt={alt} decoding="async" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: radius.md, border: `1px solid ${c.border}` }} />
              </div>
            </Sheet>
          </>
        )}

        <section>
          <Kicker as="h4" color={tone.zafiro.fg}>Ubicaciones clave</Kicker>
          <ul style={{ ...listReset, ...stack(6) }}>
            {map.locations.map((loc, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <MapPin size={15} aria-hidden style={{ color: tone.zafiro.fg, flexShrink: 0, marginTop: 3 }} />
                <span style={bodyText}>{loc}</span>
              </li>
            ))}
          </ul>
        </section>
        {map.notes && (
          <p style={{ fontSize: fs.sm, color: c.muted, fontStyle: 'italic', lineHeight: 1.55 }}>{map.notes}</p>
        )}
      </div>
    </Disclosure>
  )
}

// ── Chapter detail ────────────────────────────────────────────
type DetailTab = 'resumen' | 'escenas' | 'pnjs' | 'combates'
const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'escenas', label: 'Escenas' },
  { id: 'pnjs', label: 'PNJs' },
  { id: 'combates', label: 'Combates' },
]

function ChapterDetail({ chapter, onBack }: { chapter: AdventureChapter; onBack: () => void }) {
  const [tab, setTab] = useState<DetailTab>('resumen')
  const rootRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const idPrefix = `cap-${chapter.id}`

  // Focus management: the new view starts at its top, with focus on its title
  useEffect(() => {
    const root = rootRef.current
    const header = headerRef.current
    if (root && header) {
      const offset = parseFloat(getComputedStyle(header).top) || 0
      const top = root.getBoundingClientRect().top + window.scrollY - offset
      if (window.scrollY > top) window.scrollTo({ top })
    }
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div ref={rootRef} style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* Sticky header */}
      <div
        ref={headerRef}
        className="sticky-under-topbar glass"
        style={{ borderBottom: `1px solid ${c.border}`, padding: '12px 16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Button
            variant="secondary"
            onClick={onBack}
            icon={<ChevronLeft size={18} aria-hidden />}
            style={{ flexShrink: 0, paddingLeft: 10 }}
          >
            Volver
          </Button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...eyebrow, color: CHAPTER.fg, lineHeight: 1.4 }}>
              Capítulo {chapter.number}
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              style={{
                ...titleText, fontSize: fs.lg, color: c.text, lineHeight: 1.2,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}
            >
              {chapter.title}
            </h1>
          </div>
          <span style={{ ...pill(CHAPTER), flexShrink: 0 }}>
            <LevelRange from={chapter.levelFrom} to={chapter.levelTo} />
          </span>
        </div>

        {/* Tabs */}
        <Tabs<DetailTab>
          idPrefix={idPrefix}
          ariaLabel={`Secciones del capítulo ${chapter.number}`}
          tabs={DETAIL_TABS}
          value={tab}
          onChange={setTab}
          stretch
          size="sm"
        />
      </div>

      {/* Tab content */}
      <TabPanel idPrefix={idPrefix} id={tab} style={{ padding: '20px 16px 48px' }}>

        {/* ── Resumen ── */}
        {tab === 'resumen' && (
          <div style={stack(28)}>

            {/* Summary */}
            <p
              style={{
                ...proseText, fontSize: fs.lg, lineHeight: 1.55,
                padding: '16px 18px', borderRadius: radius.lg,
                background: CHAPTER.bg, border: `1px solid ${CHAPTER.border}`,
              }}
            >
              {chapter.summary}
            </p>

            {/* Background */}
            <section>
              <SectionTitle>Trasfondo del capítulo</SectionTitle>
              <p style={proseText}>{chapter.background}</p>
            </section>

            {/* Prep checklist */}
            <section>
              <SectionTitle>Lista de verificación DJ</SectionTitle>
              <div style={{ padding: '14px 16px', borderRadius: radius.lg, background: c.s1, border: `1px solid ${c.border}`, boxShadow: shadow[1] }}>
                <LozengeList items={chapter.prepChecklist} />
              </div>
            </section>

            {/* Progression */}
            <section>
              <SectionTitle>Progresión de personajes</SectionTitle>
              <ul style={{ ...listReset, ...stack(8) }}>
                {chapter.progressionItems.map((item, i) => {
                  const meta = PROGRESSION_META[item.type]
                  const Icon = meta.icon
                  return (
                    <li
                      key={i}
                      className="rise"
                      style={{
                        ...riseIndex(i),
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                        padding: '12px 14px', borderRadius: radius.md,
                        background: c.s1, border: `1px solid ${c.border}`,
                      }}
                    >
                      <span role="img" aria-label={meta.label} title={meta.label} style={{ display: 'flex', flexShrink: 0 }}>
                        <IconTile t={meta.tone} size={30}><Icon size={15} aria-hidden /></IconTile>
                      </span>
                      <p style={{ ...bodyText, paddingTop: 4 }}>{item.text}</p>
                    </li>
                  )
                })}
              </ul>
            </section>

            {/* PDF reference */}
            <p
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: radius.md,
                background: c.s2, border: `1px solid ${c.border}`,
                fontSize: fs.sm, color: c.muted, lineHeight: 1.5,
              }}
            >
              <BookOpen size={16} aria-hidden style={{ color: CHAPTER.fg, flexShrink: 0 }} />
              Páginas del libro: {chapter.pdfPages.from}–{chapter.pdfPages.to}
            </p>
          </div>
        )}

        {/* ── Escenas ── */}
        {tab === 'escenas' && (
          <div style={stack(16)}>
            {/* Legend */}
            <ul aria-label="Tipos de escena" style={{ ...listReset, display: 'flex', gap: '6px 14px', flexWrap: 'wrap' }}>
              {(Object.entries(SCENE_META) as [SceneType, typeof SCENE_META[SceneType]][]).map(([type, meta]) => (
                <li key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SceneIcon type={type} size={14} />
                  <span style={{ fontSize: fs.xs, fontWeight: 550, color: c.muted }}>{meta.label}</span>
                </li>
              ))}
            </ul>
            <ul style={{ ...listReset, ...stack(10) }}>
              {chapter.scenes.map((scene, i) => (
                <li key={scene.id} className="rise" style={riseIndex(i)}>
                  <SceneCard scene={scene} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── PNJs ── */}
        {tab === 'pnjs' && (
          <div style={stack(28)}>
            {/* Group by role */}
            {(['special', 'ally', 'villain', 'neutral'] as NpcRole[]).map((role) => {
              const group = chapter.npcs.filter((n) => n.role === role)
              if (group.length === 0) return null
              return (
                <section key={role}>
                  <SectionTitle>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <NpcRoleIcon role={role} size={16} />
                      {NPC_ROLE_LABEL[role]}s
                    </span>
                  </SectionTitle>
                  <ul style={{ ...listReset, ...stack(8) }}>
                    {group.map((npc, i) => (
                      <li key={npc.name} className="rise" style={riseIndex(i)}>
                        <NpcCard npc={npc} />
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        )}

        {/* ── Combates ── */}
        {tab === 'combates' && (
          <div style={stack(28)}>
            <section>
              <SectionTitle>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Swords size={16} aria-hidden style={{ color: tone.rubi.fg }} />
                  Encuentros de combate
                </span>
              </SectionTitle>
              <ul style={{ ...listReset, ...stack(8) }}>
                {chapter.combats.map((cb, i) => (
                  <li key={cb.id} className="rise" style={riseIndex(i)}>
                    <CombatCard combat={cb} />
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <SectionTitle>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <MapIcon size={16} aria-hidden style={{ color: tone.zafiro.fg }} />
                  Mapas del capítulo
                </span>
              </SectionTitle>
              <ul style={{ ...listReset, ...stack(8) }}>
                {chapter.maps.map((m, i) => (
                  <li key={m.id} className="rise" style={riseIndex(i)}>
                    <MapCard map={m} />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

      </TabPanel>
    </div>
  )
}

// ── Chapter list card ─────────────────────────────────────────
/** Chapter number inside the book's gold medallion */
function Medallion({ n, muted = false }: { n: number; muted?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'relative', width: 52, height: 52, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: muted ? c.borderStrong : c.goldOrnament,
      }}
    >
      <CosmereIcon name="ornamento-medallon" size={52} square style={{ position: 'absolute', inset: 0 }} />
      <span
        style={{
          position: 'relative', fontFamily: font.display, fontSize: fs.xl - 1, fontWeight: 600, lineHeight: 1,
          fontVariantNumeric: 'lining-nums tabular-nums', color: muted ? c.subtle : CHAPTER.fg,
        }}
      >
        {String(n).padStart(2, '0')}
      </span>
    </span>
  )
}

const chapterCardId = (id: string) => `cap-card-${id}`

function ChapterCard({ chapter, onClick }: { chapter: AdventureChapter; onClick: () => void }) {
  return (
    <button
      id={chapterCardId(chapter.id)}
      type="button"
      onClick={onClick}
      className="ui-card ui-card--interactive"
      style={{
        ...buttonReset,
        display: 'flex', alignItems: 'center', gap: 16,
        width: '100%', padding: 16, textAlign: 'left',
        background: c.s1, border: `1px solid ${c.border}`, borderRadius: radius.lg, boxShadow: shadow[1],
      }}
    >
      <Medallion n={chapter.number} />

      <span style={{ display: 'block', flex: 1, minWidth: 0 }}>
        <span className="sr-only">Capítulo {chapter.number}: </span>
        {/* Title */}
        <span style={{ display: 'block', fontFamily: font.display, fontSize: fs.lg + 1, fontWeight: 600, lineHeight: 1.25, color: c.text }}>
          {chapter.title}
        </span>

        {/* Summary */}
        <span
          style={{
            fontSize: fs.sm, color: c.muted, lineHeight: 1.5, marginTop: 4,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
          }}
        >
          {chapter.summary}
        </span>

        {/* Stats row */}
        <span style={{ display: 'flex', gap: '6px 12px', flexWrap: 'wrap', alignItems: 'center', marginTop: 10 }}>
          <span style={pill(CHAPTER)}>
            <LevelRange from={chapter.levelFrom} to={chapter.levelTo} />
          </span>
          {[
            { icon: BookOpen, count: chapter.scenes.length, label: 'escenas' },
            { icon: Users, count: chapter.npcs.length, label: 'PNJs' },
            { icon: Swords, count: chapter.combats.length, label: 'combates' },
            { icon: MapIcon, count: chapter.maps.length, label: 'mapas' },
          ].map(({ icon: Icon, count, label }) => (
            <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: fs.xs, color: c.subtle, fontVariantNumeric: 'tabular-nums' }}>
              <Icon size={13} aria-hidden />
              {count} {label}
            </span>
          ))}
        </span>
      </span>

      <ChevronRight size={20} aria-hidden style={{ color: c.subtle, flexShrink: 0 }} />
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────
export function CaminapiedrasPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const lastOpenedRef = useRef<string | null>(null)

  const selected = selectedId ? CHAPTERS.find((ch) => ch.id === selectedId) : null

  // Focus management: back from a chapter, focus returns to its card
  useEffect(() => {
    if (selectedId || !lastOpenedRef.current) return
    document.getElementById(chapterCardId(lastOpenedRef.current))?.focus()
    lastOpenedRef.current = null
  }, [selectedId])

  if (selected) {
    return <ChapterDetail chapter={selected} onBack={() => setSelectedId(null)} />
  }

  return (
    <div style={{ ...page, paddingBottom: 48 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <span aria-hidden style={{ display: 'flex', color: c.goldOrnament, flexShrink: 0 }}>
          <CosmereIcon name="archivo-tormentas" size={56} />
        </span>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ ...titleText, fontSize: fs['2xl'], color: c.text }}>
            Caminapiedras
          </h1>
          <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 4 }}>
            Escenario de campaña — Guía para la Directora de Juego
          </p>
        </div>
      </header>

      <ul style={{ ...listReset, ...stack(10) }}>
        {CHAPTERS.map((chapter, i) => (
          <li key={chapter.id} className="rise" style={riseIndex(i)}>
            <ChapterCard
              chapter={chapter}
              onClick={() => { lastOpenedRef.current = chapter.id; setSelectedId(chapter.id) }}
            />
          </li>
        ))}

        {/* Placeholder for upcoming chapters */}
        {[2, 3, 4, 5, 6, 7].map((n, i) => (
          <li
            key={n}
            className="rise"
            style={{
              ...riseIndex(CHAPTERS.length + i),
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '12px 16px', borderRadius: radius.lg,
              background: 'color-mix(in srgb, var(--surface-1) 55%, transparent)',
              border: `1px dashed ${c.borderBright}`,
            }}
          >
            <Medallion n={n} muted />
            <span style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: fs.base, fontWeight: 600, color: c.muted }}>Capítulo {n}</span>
              <span style={{ display: 'block', fontSize: fs.sm, color: c.subtle }}>Próximamente</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
