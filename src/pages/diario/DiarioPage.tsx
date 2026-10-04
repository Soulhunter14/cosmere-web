import { Fragment, useId, useState, type CSSProperties, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Drama, Flag, Sparkles, UserRound, type LucideIcon } from 'lucide-react'
import { diaryApi } from '../../api/diary'
import { Button, EmptyState, PageHeader, SectionTitle, Sheet, Spinner } from '../../components/ui'
import { CosmereIcon } from '../../components/CosmereIcon'
import { useWorldConfig } from '../../store/campaignStore'
import { buttonReset, c, eyebrow, font, fs, numeral, page, radius, shadow, titleText, tone, type Tone } from '../../theme'
import type { DiaryEntry, DiaryMentionType } from '../../types'

// ── Mention types: gem tone + Lucide glyph (colour is never the only cue) ──

const MENTION_STYLE: Record<DiaryMentionType, { tone: Tone; label: string; icon: LucideIcon | null }> = {
  pj:      { tone: tone.amatista,  label: 'PJ',      icon: UserRound },
  npc:     { tone: tone.heliodoro, label: 'NPC',     icon: Drama },
  spren:   { tone: tone.esmeralda, label: 'Spren',   icon: Sparkles },
  faction: { tone: tone.rubi,      label: 'Facción', icon: Flag },
  unknown: { tone: tone.cuarzo,    label: '',        icon: null },
}

const LEGEND_LABELS: Record<string, string> = { pj: 'Personajes', npc: 'NPCs', spren: 'Spren', faction: 'Facciones' }

/** Small chip for participant names and legend entries */
const chip = (t: Tone): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 9px',
  borderRadius: radius.full,
  background: t.bg,
  border: `1px solid ${t.border}`,
  color: t.fg,
  fontFamily: font.ui,
  fontSize: fs.xs,
  fontWeight: 600,
  lineHeight: 1.45,
  whiteSpace: 'nowrap',
})

const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 }

/** Inline [[mention]] inside the chronicle text */
function MentionChip({ type, display }: { type: DiaryMentionType; display: string }) {
  const s = MENTION_STYLE[type]
  const Icon = s.icon
  return (
    <span
      style={{
        display: 'inline',
        padding: '1px 7px 2px',
        borderRadius: radius.xs,
        background: s.tone.bg,
        border: `1px solid ${s.tone.border}`,
        color: s.tone.fg,
        fontFamily: font.ui,
        fontSize: '0.8em',
        fontWeight: 600,
        letterSpacing: '0.005em',
        whiteSpace: 'nowrap',
      }}
    >
      {Icon && <Icon size="0.95em" aria-hidden style={{ display: 'inline-block', verticalAlign: '-0.12em', marginRight: 4 }} />}
      {s.label && <span className="sr-only">{s.label}: </span>}
      {display}
    </span>
  )
}

// ── Body renderer ──────────────────────────────────────────────────────────
// Mention parsing is unchanged ([[pj - …]], [[npc - …]], [[spren - …]], [[facción - …]], anything else = unknown).
// Lines are grouped into real blocks so the markup is valid: paragraphs (<p>, single line breaks kept as <br/>)
// and '- ' bullet lines (<ul><li>).

function renderBody(body: string): ReactNode[] {
  const parts = body.split(/(\[\[[^\]]+\]\])/g)

  const blocks: ReactNode[] = []
  let paragraph: ReactNode[][] = []
  let list: ReactNode[][] = []
  let line: ReactNode[] = []
  let lineText = ''
  let lineHasMention = false
  let lineIsItem = false
  let lineStarted = false

  const flushParagraph = () => {
    if (paragraph.length === 0) return
    const lines = paragraph
    blocks.push(
      <p key={`b${blocks.length}`}>
        {lines.map((l, k) => <Fragment key={k}>{k > 0 && <br />}{l}</Fragment>)}
      </p>,
    )
    paragraph = []
  }
  const flushList = () => {
    if (list.length === 0) return
    const items = list
    blocks.push(
      <ul key={`b${blocks.length}`} style={{ ...listReset, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((l, k) => (
          <li key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 12, paddingLeft: 2 }}>
            <CosmereIcon name="ornamento-rombo" size={8} style={{ color: c.goldOrnament }} />
            <span style={{ minWidth: 0 }}>{l}</span>
          </li>
        ))}
      </ul>,
    )
    list = []
  }
  const endLine = () => {
    if (!lineHasMention && lineText.trim() === '') {
      flushParagraph()
      flushList()
    } else if (lineIsItem) {
      flushParagraph()
      list.push(line)
    } else {
      flushList()
      paragraph.push(line)
    }
    line = []
    lineText = ''
    lineHasMention = false
    lineIsItem = false
    lineStarted = false
  }

  parts.forEach((part, i) => {
    const match = part.match(/^\[\[([^\]]+)\]\]$/)
    if (!match) {
      part.split('\n').forEach((text, j) => {
        if (j > 0) endLine()
        let shown = text
        if (!lineStarted && text.startsWith('- ')) {
          lineIsItem = true
          shown = text.slice(2)
        }
        if (text !== '') lineStarted = true
        lineText += text
        if (shown) line.push(<Fragment key={`${i}-${j}`}>{shown}</Fragment>)
      })
      return
    }

    const raw = match[1].trim()
    const lower = raw.toLowerCase()
    let type: DiaryMentionType = 'unknown'
    let display = raw

    if (lower.startsWith('pj -')) { type = 'pj'; display = raw.replace(/^pj\s*-\s*/i, '') }
    else if (lower.startsWith('npc -')) { type = 'npc'; display = raw.replace(/^npc\s*-\s*/i, '') }
    else if (lower.startsWith('spren -')) { type = 'spren'; display = raw.replace(/^spren\s*-\s*/i, '') }
    else if (/^facci[oó]n\s*-/i.test(lower)) { type = 'faction'; display = raw.replace(/^facci[oó]n\s*-\s*/i, '') }

    lineHasMention = true
    lineStarted = true
    line.push(<MentionChip key={i} type={type} display={display} />)
  })
  endLine()
  flushParagraph()
  flushList()
  return blocks
}

// ── Session number inside the book's gold medallion ────────────────────────

function SessionMedallion({ n, size = 44 }: { n: number; size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 35%, var(--gold-bg), transparent 70%)',
        color: c.goldOrnament,
      }}
    >
      <CosmereIcon name="ornamento-medallon" size={size} square style={{ position: 'absolute', inset: 0 }} />
      <span style={{ ...numeral, position: 'relative', fontSize: Math.round(size * 0.34), letterSpacing: 0, color: c.text }}>
        {String(n).padStart(2, '0')}
      </span>
    </span>
  )
}

// ── Diary entry sheet ──────────────────────────────────────────────────────

function DiaryEntrySheet({ entry, onClose }: { entry: DiaryEntry; onClose: () => void }) {
  const legendId = useId()
  const { features } = useWorldConfig()
  // Legend order. Spren mentions are a feature of the world (WorldConfig.features.mencionSpren), so its legend entry goes with it
  const legendTypes = (['pj', 'npc', 'spren', 'faction'] as DiaryMentionType[]).filter((type) => type !== 'spren' || features.mencionSpren)
  return (
    <Sheet
      open
      onClose={onClose}
      maxWidth={620}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <SessionMedallion n={entry.number} size={52} />
          <span style={{ display: 'block', minWidth: 0 }}>
            <span style={{ ...eyebrow, display: 'block', color: c.gold, marginBottom: 4 }}>Sesión {entry.number}</span>
            <span style={{ ...titleText, display: 'block', fontSize: fs.xl, color: c.text }}>{entry.title}</span>
          </span>
        </span>
      }
      footer={
        <Button variant="secondary" size="lg" fullWidth onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      {/* Participants */}
      {entry.participants.length > 0 && (
        <ul aria-label="Participantes" style={{ ...listReset, display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {entry.participants.map((p) => (
            <li key={p} style={chip(MENTION_STYLE.pj.tone)}>{p}</li>
          ))}
        </ul>
      )}

      {/* Full-width gold filete under the left-aligned header: height follows the ornament's own proportions */}
      <CosmereIcon
        name="ornamento-filete"
        size={5}
        style={{ display: 'flex', width: '100%', height: 'auto', aspectRatio: '384.77 / 5.2', color: c.goldOrnament, marginBottom: 20 }}
      />

      {/* Body: long-form reading. Focusable (and focused first) so the keyboard can scroll a long chronicle. */}
      <article
        tabIndex={0}
        aria-label={`Crónica de la sesión ${entry.number}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8em',
          maxWidth: '62ch',
          fontFamily: font.display,
          fontSize: fs.lg,
          lineHeight: 1.65,
          color: c.text,
          overflowWrap: 'break-word',
        }}
      >
        {renderBody(entry.body)}
      </article>

      {/* Mention legend */}
      {entry.mentions.length > 0 && (
        <section
          aria-labelledby={legendId}
          style={{ marginTop: 28, padding: '14px 16px 16px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}
        >
          <SectionTitle as="h3" id={legendId} style={{ marginBottom: 12 }}>En esta sesión</SectionTitle>
          <dl style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: 0 }}>
            {legendTypes.map((type) => {
              const items = entry.mentions.filter(m => m.type === type)
              if (items.length === 0) return null
              const s = MENTION_STYLE[type]
              const Icon = s.icon
              return (
                <div key={type} style={{ display: 'grid', gridTemplateColumns: '104px minmax(0, 1fr)', gap: 10, alignItems: 'start' }}>
                  <dt style={{ ...eyebrow, color: s.tone.fg, display: 'flex', alignItems: 'center', gap: 6, minHeight: 24 }}>
                    {Icon && <Icon size={14} aria-hidden />}
                    {LEGEND_LABELS[type]}
                  </dt>
                  <dd style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: 0 }}>
                    {items.map(m => (
                      <span key={m.raw} style={chip(s.tone)}>{m.display}</span>
                    ))}
                  </dd>
                </div>
              )
            })}
          </dl>
        </section>
      )}
    </Sheet>
  )
}

// ── Diary entry card ───────────────────────────────────────────────────────

function DiaryEntryCard({ entry, index, onClick }: { entry: DiaryEntry; index: number; onClick: () => void }) {
  const id = useId()

  const cleanPreview = entry.preview.replace(/\[\[([^\]]+)\]\]/g, (_, raw) => {
    return raw.replace(/^(pj|npc|spren|facci[oó]n)\s*-\s*/i, '').trim()
  })

  const hasParticipants = entry.participants.length > 0
  const describedBy = [hasParticipants && `${id}-p`, `${id}-x`].filter(Boolean).join(' ')

  return (
    <li className="rise" style={{ '--i': index } as CSSProperties}>
      <button
        type="button"
        onClick={onClick}
        aria-haspopup="dialog"
        aria-labelledby={`${id}-n ${id}-t`}
        aria-describedby={describedBy}
        className="ui-card ui-card--interactive"
        style={{
          ...buttonReset,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          width: '100%',
          padding: '16px 14px 16px 16px',
          textAlign: 'left',
          background: c.s1,
          border: `1px solid ${c.border}`,
          borderRadius: radius.lg,
          boxShadow: shadow[1],
        }}
      >
        <SessionMedallion n={entry.number} />

        <span style={{ display: 'block', flex: 1, minWidth: 0 }}>
          <span id={`${id}-n`} className="sr-only">Sesión {entry.number}</span>
          <span id={`${id}-t`} style={{ display: 'block', fontFamily: font.display, fontSize: 19, fontWeight: 600, lineHeight: 1.25, color: c.text }}>
            {entry.title}
          </span>

          {/* Participants */}
          {hasParticipants && (
            <span id={`${id}-p`} style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
              <span className="sr-only">Participantes:</span>
              {entry.participants.slice(0, 5).map((p) => (
                <span key={p} style={chip(MENTION_STYLE.pj.tone)}>{p}</span>
              ))}
              {entry.participants.length > 5 && (
                <span style={{ fontSize: fs.xs, fontWeight: 600, color: c.subtle, alignSelf: 'center', paddingLeft: 2 }}>
                  +{entry.participants.length - 5}
                </span>
              )}
            </span>
          )}

          <span
            id={`${id}-x`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginTop: 8,
              fontFamily: font.display,
              fontSize: fs.md,
              lineHeight: 1.45,
              color: c.muted,
            }}
          >
            {cleanPreview}
          </span>
        </span>

        <ChevronRight size={18} aria-hidden style={{ color: c.subtle, alignSelf: 'center', flexShrink: 0 }} />
      </button>
    </li>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export function DiarioPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const [selected, setSelected] = useState<DiaryEntry | null>(null)
  const cfg = useWorldConfig()

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['diary', cId],
    queryFn: () => diaryApi.getAll(cId),
  })

  if (isLoading) return <Spinner />

  return (
    <div style={page}>
      <PageHeader
        title="Diario de campaña"
        subtitle={`${entries.length} ${entries.length !== 1 ? 'sesiones' : 'sesión'}`}
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={<CosmereIcon name={cfg.emblema} size={28} />}
          title="El diario está vacío"
          description="Las crónicas de cada sesión aparecerán aquí."
        />
      ) : (
        <ul style={{ ...listReset, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.map((e, i) => (
            <DiaryEntryCard key={e.slug} entry={e} index={i} onClick={() => setSelected(e)} />
          ))}
        </ul>
      )}

      {selected && <DiaryEntrySheet entry={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
