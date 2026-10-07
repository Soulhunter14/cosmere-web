import { useId, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarCheck, CalendarClock, Check, Plus, X } from 'lucide-react'
import { proposalsApi } from '../../api/proposals'
import { calendarError } from './calendarErrors'
import { useCampaignStore } from '../../store/campaignStore'
import {
  Button, ConfirmDialog, Disclosure, EmptyState, ErrorMessage, Field, IconButton, Input, PageHeader, SectionTitle, Segmented, Sheet, Spinner,
} from '../../components/ui'
import { c, eyebrow, font, fs, page, pill, radius, tone, type Tone } from '../../theme'
import type { ProposalResponse, ProposalDateResponse, ProposalSlot, ProposedSlotRequest } from '../../types'

// ─── helpers ────────────────────────────────────────────────────────────────
// (Public helpers kept here because other modules may import them; they are plain functions, not components.)

// eslint-disable-next-line react-refresh/only-export-components
export function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

// eslint-disable-next-line react-refresh/only-export-components
export function todayStr() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 'domingo, 11 de octubre' → 'Domingo, 11 de octubre' (display only) */
const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Fixed slots of a proposed day: each one is voted, promoted or discarded on its own */
const SLOTS: Record<ProposalSlot, { label: string; time: string }> = {
  morning: { label: 'Mañana', time: '10:00' },
  afternoon: { label: 'Tarde', time: '15:00' },
}

/** "Mañana · 10:00" for a slot, "18:00" for a free time */
const slotLabel = (d: ProposalDateResponse) =>
  d.slot ? `${SLOTS[d.slot].label} · ${formatTime(d.proposedDate)}` : formatTime(d.proposedDate)

/** "Sábado, 18 de octubre · Mañana · 10:00" */
// eslint-disable-next-line react-refresh/only-export-components
export const dateSlotLabel = (d: ProposalDateResponse) => `${sentenceCase(formatDate(d.proposedDate))} · ${slotLabel(d)}`

/** Proposal dates grouped by local day, in order */
function groupByDay(dates: ProposalDateResponse[]) {
  const days: { key: string; day: Date; label: string; dates: ProposalDateResponse[] }[] = []
  for (const d of dates) {
    const when = new Date(d.proposedDate)
    const key = when.toDateString()
    const day = days.find((x) => x.key === key)
    if (day) day.dates.push(d)
    else days.push({ key, day: when, label: sentenceCase(formatDate(d.proposedDate)), dates: [d] })
  }
  return days
}

/** The slot's start time has already gone by: it can no longer be voted or promoted */
// eslint-disable-next-line react-refresh/only-export-components
export const slotPassed = (d: ProposalDateResponse) => new Date(d.proposedDate).getTime() < Date.now()

const STATUS: Record<string, { label: string; tone: Tone }> = {
  Pending: { label: 'Abierta', tone: tone.brand },
  Promoted: { label: 'Confirmada', tone: tone.esmeralda },
  Rejected: { label: 'Rechazada', tone: tone.rubi },
}

/** Status of one date or slot once the GM has resolved it */
const DATE_STATUS: Record<string, { label: string; tone: Tone }> = {
  Accepted: { label: 'Promovida', tone: tone.esmeralda },
  Rejected: { label: 'Descartada', tone: tone.rubi },
}

/** Tinted gem-tone button (Promover = esmeralda). Local until Button gets a `success` variant. */
const toneButton = (t: Tone): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  minHeight: 44, padding: '0 14px', borderRadius: radius.md,
  background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
  fontSize: fs.sm + 1, fontWeight: 650, cursor: 'pointer', whiteSpace: 'nowrap',
})

const cardList: CSSProperties = { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }

// ─── sub-components ─────────────────────────────────────────────────────────

function ToneBadge({ label, t }: { label: string; t: Tone }) {
  return (
    <span style={{
      ...pill(t),
      fontFamily: font.ui, fontSize: fs.eyebrow, fontWeight: 700, letterSpacing: '0.08em',
      padding: '2px 8px', flexShrink: 0,
    }}>
      {label.toUpperCase()}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.Pending
  return <ToneBadge label={s.label} t={s.tone} />
}

/** Toggle button for a vote ("Puedo" / "No puedo"): aria-pressed + gem tone + icon when chosen */
function VoteButton({
  pressed,
  t,
  icon,
  children,
  ...props
}: { pressed: boolean; t: Tone; icon: ReactNode; children: ReactNode } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={pressed ? 'ui-btn' : 'ui-btn ui-btn--secondary'}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        minHeight: 44, padding: '0 12px', borderRadius: radius.md, cursor: 'pointer',
        fontSize: fs.sm + 1, fontWeight: 650,
        background: pressed ? t.bg : c.s2,
        border: `1px solid ${pressed ? t.fg : c.borderBright}`,
        boxShadow: pressed ? `inset 0 0 0 1px ${t.fg}` : 'none',
        color: pressed ? t.fg : c.muted,
      }}
      {...props}
    >
      {pressed && icon}
      {children}
    </button>
  )
}

/** One proposed date or slot (inside its day): votes, and the GM's actions while it is pending */
function VoteBar({ date, dayLabel, isPending, onVote, actions }: {
  date: ProposalDateResponse
  dayLabel: string
  isPending: boolean
  onVote: (dateId: number, canAttend: boolean) => void
  actions?: ReactNode
}) {
  const total = date.canCount + date.cannotCount
  const canPct = total > 0 ? (date.canCount / total) * 100 : 0
  const cannotPct = total > 0 ? (date.cannotCount / total) * 100 : 0

  const myVote = date.currentUserVote // null | true | false
  const open = date.status === 'Pending'
  const past = open && slotPassed(date)
  const resolved = past ? { label: 'Pasada', tone: tone.cuarzo } : DATE_STATUS[date.status]
  const time = formatTime(date.proposedDate)

  return (
    <div
      role="group"
      aria-label={`${dayLabel}, ${slotLabel(date)}${past ? ', pasada' : ''}`}
      style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: 12, borderRadius: radius.md,
        border: `1px solid ${c.border}`,
        background: open && !past ? 'transparent' : c.s2,
      }}
    >
      {/* Slot label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <p style={{ minWidth: 0, display: 'inline-flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: fs.base, fontWeight: 650, color: open && !past ? c.text : c.muted }}>
            {date.slot ? SLOTS[date.slot].label : time}
          </span>
          {date.slot && (
            <span style={{ fontSize: fs.sm, fontWeight: 550, color: c.muted, fontVariantNumeric: 'tabular-nums' }}>
              {time}
            </span>
          )}
        </p>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: fs.xs, color: c.subtle, fontVariantNumeric: 'tabular-nums' }}>
            {total === 0 ? 'Sin votos' : `${date.canCount} sí · ${date.cannotCount} no`}
          </span>
          {resolved && <ToneBadge label={resolved.label} t={resolved.tone} />}
        </span>
      </div>

      {/* Vote bar (the counts above carry the same data for screen readers) */}
      {total > 0 && (
        <div aria-hidden style={{ display: 'flex', height: 6, borderRadius: radius.full, overflow: 'hidden', background: c.track }}>
          <div style={{ width: `${canPct}%`, background: tone.esmeralda.fg, transition: 'width 0.3s var(--ease-out)' }} />
          <div style={{ width: `${cannotPct}%`, background: tone.rubi.fg, transition: 'width 0.3s var(--ease-out)' }} />
        </div>
      )}

      {/* Vote buttons (only while the slot is open and still ahead) */}
      {open && !past && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <VoteButton
            pressed={myVote === true}
            t={tone.esmeralda}
            icon={<Check size={16} aria-hidden />}
            onClick={() => onVote(date.id, true)}
            disabled={isPending}
          >
            Puedo
          </VoteButton>
          <VoteButton
            pressed={myVote === false}
            t={tone.rubi}
            icon={<X size={16} aria-hidden />}
            onClick={() => onVote(date.id, false)}
            disabled={isPending}
          >
            No puedo
          </VoteButton>
        </div>
      )}

      {open && actions}
    </div>
  )
}

/** The proposal's dates grouped by day; the slots of a day are voted, promoted and discarded independently */
export function ProposalDates({
  proposal,
  isGm,
  votePending,
  onVote,
  onPromoteDate,
  onRejectDate,
  onlyDay,
  dayNote,
}: {
  proposal: ProposalResponse
  isGm: boolean
  votePending: boolean
  onVote: (proposalId: number, dateId: number, canAttend: boolean) => void
  onPromoteDate: (p: ProposalResponse, d: ProposalDateResponse, trigger: HTMLElement) => void
  onRejectDate: (p: ProposalResponse, d: ProposalDateResponse, trigger: HTMLElement) => void
  /** Show only the slots of this local day (selected day in the calendar) */
  onlyDay?: Date
  /** Extra line under a day's heading (e.g. who has that day blocked) */
  dayNote?: (day: Date) => ReactNode
}) {
  const isPending = proposal.status === 'Pending'
  const days = groupByDay(proposal.dates).filter((d) => !onlyDay || d.key === onlyDay.toDateString())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {days.map((day) => (
        <div key={day.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <p style={{ fontSize: fs.base, fontWeight: 650, color: c.text }}>{day.label}</p>
            {dayNote?.(day.day)}
          </div>
          {day.dates.map((d) => (
            <VoteBar
              key={d.id}
              date={d}
              dayLabel={day.label}
              isPending={votePending || !isPending}
              onVote={(dateId, canAttend) => onVote(proposal.id, dateId, canAttend)}
              actions={isGm && isPending ? (
                <div style={{ display: 'grid', gridTemplateColumns: slotPassed(d) ? '1fr' : '1fr 1fr', gap: 8 }}>
                  {!slotPassed(d) && (
                    <button
                      type="button"
                      className="ui-btn"
                      aria-label={`Promover ${dateSlotLabel(d)}`}
                      onClick={(e) => onPromoteDate(proposal, d, e.currentTarget)}
                      style={toneButton(tone.esmeralda)}
                    >
                      <CalendarCheck size={16} aria-hidden />
                      Promover
                    </button>
                  )}
                  <Button
                    variant="danger"
                    aria-label={`Descartar ${dateSlotLabel(d)}`}
                    onClick={(e) => onRejectDate(proposal, d, e.currentTarget)}
                  >
                    Descartar
                  </Button>
                </div>
              ) : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function ProposalCard({
  proposal,
  isGm,
  onReject,
  onPromoteDate,
  onRejectDate,
  onVote,
  votePending,
}: {
  proposal: ProposalResponse
  isGm: boolean
  onReject: (p: ProposalResponse) => void
  onPromoteDate: (p: ProposalResponse, d: ProposalDateResponse, trigger: HTMLElement) => void
  onRejectDate: (p: ProposalResponse, d: ProposalDateResponse, trigger: HTMLElement) => void
  onVote: (proposalId: number, dateId: number, canAttend: boolean) => void
  votePending: boolean
}) {
  const isPending = proposal.status === 'Pending'
  const accent = (STATUS[proposal.status] ?? STATUS.Pending).tone.fg
  const n = proposal.dates.length

  return (
    <Disclosure
      defaultOpen={proposal.status === 'Pending'}
      accent={accent}
      style={{ boxShadow: `inset 3px 0 0 ${accent}` }}
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {proposal.title}
          <StatusBadge status={proposal.status} />
        </span>
      }
      summary={
        <>
          {proposal.notes && <span style={{ display: 'block' }}>{proposal.notes}</span>}
          <span style={{ display: 'block', fontSize: fs.xs, color: c.subtle, marginTop: 2 }}>
            {n} fecha{n !== 1 ? 's' : ''} propuesta{n !== 1 ? 's' : ''}
          </span>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ProposalDates
          proposal={proposal}
          isGm={isGm}
          votePending={votePending}
          onVote={onVote}
          onPromoteDate={onPromoteDate}
          onRejectDate={onRejectDate}
        />

        {/* GM: close the whole proposal (discards the slots still pending) */}
        {isGm && isPending && (
          <Button variant="danger" onClick={() => onReject(proposal)}>
            Cerrar propuesta
          </Button>
        )}
      </div>
    </Disclosure>
  )
}

// ─── promote dialog ──────────────────────────────────────────────────────────

export interface PromoteForm {
  title: string
  location: string
}

/** Promotes one date or slot to a session; the other slots of the proposal stay as they are */
export function PromoteDialog({
  proposal,
  date,
  onConfirm,
  onCancel,
  isPending,
  error,
}: {
  proposal: ProposalResponse
  date: ProposalDateResponse
  onConfirm: (form: PromoteForm) => void
  onCancel: () => void
  isPending: boolean
  error?: string | null
}) {
  const [form, setForm] = useState<PromoteForm>({ title: proposal.title, location: '' })
  const canSubmit = form.title.trim().length > 0

  return (
    <Sheet
      open
      onClose={onCancel}
      title="Promover a sesión"
      footer={
        <>
          <Button variant="secondary" size="lg" onClick={onCancel} style={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button
            size="lg"
            onClick={() => canSubmit && onConfirm(form)}
            disabled={!canSubmit || isPending}
            loading={isPending}
            style={{ flex: 1.4 }}
          >
            {isPending ? 'Confirmando...' : 'Confirmar sesión'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Chosen date / slot */}
        <div
          style={{
            padding: '10px 14px', borderRadius: radius.md,
            border: '1px solid var(--brand-border)', background: 'var(--brand-bg)',
          }}
        >
          <p style={{ ...eyebrow, marginBottom: 4 }}>Fecha confirmada</p>
          <p style={{ fontSize: fs.base, fontWeight: 650, color: c.text }}>{sentenceCase(formatDate(date.proposedDate))}</p>
          <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
            {slotLabel(date)} · {date.canCount} pueden, {date.cannotCount} no pueden
          </p>
        </div>

        {/* Title */}
        <Field label="Título de la sesión">
          <Input
            data-autofocus
            placeholder="Nombre de la sesión..."
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </Field>

        {/* Location */}
        <Field label="Lugar (opcional)">
          <Input
            placeholder="Lugar de la sesión..."
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
        </Field>

        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

// ─── create proposal sheet ───────────────────────────────────────────────────

/** What is proposed for a day: both slots, one of them, or a free time */
type DayMode = 'both' | ProposalSlot | 'custom'

export interface ProposalDayForm {
  date: string
  mode: DayMode
  time: string
}

export interface CreateForm {
  title: string
  notes: string
  days: ProposalDayForm[]
}

const DAY_MODES: { value: DayMode; label: string; ariaLabel?: string }[] = [
  { value: 'both', label: 'Ambas', ariaLabel: 'Mañana y tarde' },
  { value: 'morning', label: 'Mañana' },
  { value: 'afternoon', label: 'Tarde' },
  { value: 'custom', label: 'Otra hora' },
]

const modeSlots = (mode: DayMode): ProposalSlot[] =>
  mode === 'both' ? ['morning', 'afternoon'] : mode === 'custom' ? [] : [mode]

/** One proposed date per slot of each day (or one with a free time) */
// eslint-disable-next-line react-refresh/only-export-components
export function toProposedSlots(form: CreateForm): ProposedSlotRequest[] {
  const iso = (date: string, time: string) => new Date(`${date}T${time}:00`).toISOString()
  return form.days.flatMap((day): ProposedSlotRequest[] =>
    day.mode === 'custom'
      ? [{ date: iso(day.date, day.time), slot: null }]
      : modeSlots(day.mode).map((slot) => ({ date: iso(day.date, SLOTS[slot].time), slot })),
  )
}

const modeHint = (mode: DayMode) =>
  mode === 'custom'
    ? null
    : modeSlots(mode).map((s) => `${SLOTS[s].label.toLowerCase()} a las ${SLOTS[s].time}`).join(' y ')

export function CreateProposalSheet({
  onClose,
  onSubmit,
  isPending,
  error,
}: {
  onClose: () => void
  onSubmit: (form: CreateForm) => void
  isPending: boolean
  error?: string | null
}) {
  const newDay = (): ProposalDayForm => ({ date: todayStr(), mode: 'both', time: '18:00' })
  const [form, setForm] = useState<CreateForm>({ title: '', notes: '', days: [newDay()] })

  const addDay = () => setForm((f) => ({ ...f, days: [...f.days, newDay()] }))
  const removeDay = (idx: number) => setForm((f) => ({ ...f, days: f.days.filter((_, i) => i !== idx) }))
  const setDay = (idx: number, patch: Partial<ProposalDayForm>) =>
    setForm((f) => ({ ...f, days: f.days.map((d, i) => (i === idx ? { ...d, ...patch } : d)) }))

  const canSubmit = form.title.trim().length > 0 && form.days.every((d) => d.date.length > 0 && d.time.length > 0)
  const removable = form.days.length > 1

  return (
    <Sheet
      open
      onClose={onClose}
      title="Nueva propuesta"
      footer={
        <>
          <Button variant="secondary" size="lg" onClick={onClose} style={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button
            size="lg"
            onClick={() => canSubmit && onSubmit(form)}
            disabled={!canSubmit || isPending}
            loading={isPending}
            style={{ flex: 1.4 }}
          >
            {isPending ? 'Creando...' : 'Crear propuesta'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Title */}
        <Field label="Título">
          <Input
            placeholder="Ej: ¿Cuándo jugamos en mayo?"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </Field>

        {/* Notes */}
        <Field label="Notas (opcional)">
          <Input
            placeholder="Información adicional..."
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </Field>

        {/* Proposed days, each with its slots */}
        <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
          <legend style={{ ...eyebrow, padding: 0, marginBottom: 8 }}>
            Días propuestos
          </legend>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.days.map((day, idx) => {
              const hint = modeHint(day.mode)
              return (
                <li
                  key={idx}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 8,
                    padding: 10, borderRadius: radius.md, border: `1px solid ${c.border}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Input
                      type="date"
                      aria-label={`Día ${idx + 1}`}
                      value={day.date}
                      onChange={(e) => setDay(idx, { date: e.target.value })}
                      style={{ flex: 1, minWidth: 0, colorScheme: 'inherit', fontVariantNumeric: 'tabular-nums' }}
                    />
                    {removable && (
                      <IconButton label={`Quitar día ${idx + 1}`} size={44} variant="danger" onClick={() => removeDay(idx)}>
                        <X size={18} aria-hidden />
                      </IconButton>
                    )}
                  </div>
                  <Segmented<DayMode>
                    ariaLabel={`Franjas del día ${idx + 1}`}
                    size="sm"
                    options={DAY_MODES}
                    value={day.mode}
                    onChange={(mode) => setDay(idx, { mode })}
                  />
                  {day.mode === 'custom' ? (
                    <Input
                      type="time"
                      aria-label={`Hora del día ${idx + 1}`}
                      value={day.time}
                      onChange={(e) => setDay(idx, { time: e.target.value })}
                      style={{ colorScheme: 'inherit', fontVariantNumeric: 'tabular-nums' }}
                    />
                  ) : (
                    <p style={{ fontSize: fs.xs, color: c.subtle }}>
                      Se propone {hint}. Cada franja se vota y se promueve por separado.
                    </p>
                  )}
                </li>
              )
            })}
          </ol>
          <button
            type="button"
            onClick={addDay}
            className="ui-btn ui-btn--ghost"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', minHeight: 44, marginTop: 8,
              background: 'transparent', border: `1px dashed ${c.borderStrong}`, borderRadius: radius.md,
              color: c.brand, fontSize: fs.sm + 1, fontWeight: 650, cursor: 'pointer',
            }}
          >
            <Plus size={16} aria-hidden /> Añadir día
          </button>
        </fieldset>

        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export function ProposalsPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const qc = useQueryClient()
  const { isGm } = useCampaignStore()
  const openId = useId()
  const resolvedId = useId()

  const [showCreate, setShowCreate] = useState(false)
  const [confirmReject, setConfirmReject] = useState<ProposalResponse | null>(null)
  const [promoteTarget, setPromoteTarget] = useState<{ proposal: ProposalResponse; date: ProposalDateResponse } | null>(null)
  const [rejectDateTarget, setRejectDateTarget] = useState<{ proposal: ProposalResponse; date: ProposalDateResponse } | null>(null)

  const { data: proposals = [], isLoading } = useQuery<ProposalResponse[]>({
    queryKey: ['proposals', cId],
    queryFn: () => proposalsApi.getAll(cId),
  })

  const replaceProposal = (updated: ProposalResponse) =>
    qc.setQueryData<ProposalResponse[]>(['proposals', cId], (prev) =>
      prev ? prev.map((p) => (p.id === updated.id ? updated : p)) : [updated]
    )

  const createMutation = useMutation({
    mutationFn: (form: CreateForm) =>
      proposalsApi.create(cId, { title: form.title, notes: form.notes, proposedSlots: toProposedSlots(form) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals', cId] })
      setShowCreate(false)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (proposalId: number) => proposalsApi.reject(cId, proposalId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proposals', cId] }),
  })

  const promoteDateMutation = useMutation({
    mutationFn: ({ proposalId, dateId, form }: { proposalId: number; dateId: number; form: PromoteForm }) =>
      proposalsApi.promoteDate(cId, proposalId, dateId, form),
    onSuccess: (updated) => {
      replaceProposal(updated)
      qc.invalidateQueries({ queryKey: ['sessions', cId] })
      setPromoteTarget(null)
    },
  })

  const rejectDateMutation = useMutation({
    mutationFn: ({ proposalId, dateId }: { proposalId: number; dateId: number }) =>
      proposalsApi.rejectDate(cId, proposalId, dateId),
    onSuccess: replaceProposal,
  })

  const voteMutation = useMutation({
    mutationFn: ({ proposalId, dateId, canAttend }: { proposalId: number; dateId: number; canAttend: boolean }) =>
      proposalsApi.castVote(cId, proposalId, dateId, { canAttend }),
    onSuccess: replaceProposal,
  })

  const pending = proposals.filter((p) => p.status === 'Pending')
  const resolved = proposals.filter((p) => p.status !== 'Pending')

  if (isLoading) return <Spinner />

  const renderCards = (list: ProposalResponse[]) => (
    <ul style={cardList}>
      {list.map((p, i) => (
        <li key={p.id} className="rise" style={{ '--i': i } as CSSProperties}>
          <ProposalCard
            proposal={p}
            isGm={isGm}
            onReject={setConfirmReject}
            onPromoteDate={(proposal, date) => { promoteDateMutation.reset(); setPromoteTarget({ proposal, date }) }}
            onRejectDate={(proposal, date) => setRejectDateTarget({ proposal, date })}
            onVote={(proposalId, dateId, canAttend) =>
              voteMutation.mutate({ proposalId, dateId, canAttend })
            }
            votePending={voteMutation.isPending}
          />
        </li>
      ))}
    </ul>
  )

  return (
    <div style={page}>

      {/* Header */}
      <PageHeader
        title="Propuestas"
        actions={isGm && (
          <Button icon={<Plus size={16} aria-hidden />} onClick={() => { createMutation.reset(); setShowCreate(true) }}>
            Nueva propuesta
          </Button>
        )}
      />

      {proposals.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={22} aria-hidden />}
          title="Sin propuestas"
          description={isGm
            ? 'Crea una propuesta de fecha para que los jugadores voten.'
            : 'No hay propuestas de fecha todavía.'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {pending.length > 0 && (
            <section aria-labelledby={openId}>
              <SectionTitle id={openId}>Abiertas</SectionTitle>
              {renderCards(pending)}
            </section>
          )}

          {resolved.length > 0 && (
            <section aria-labelledby={resolvedId}>
              <SectionTitle id={resolvedId}>Resueltas</SectionTitle>
              {renderCards(resolved)}
            </section>
          )}
        </div>
      )}

      {/* Close proposal confirmation */}
      <ConfirmDialog
        open={!!confirmReject}
        title={`¿Cerrar "${confirmReject?.title}"?`}
        message="Las fechas que sigan pendientes se descartarán y los jugadores no podrán votar más."
        confirmLabel="Cerrar propuesta"
        onConfirm={() => {
          if (confirmReject) rejectMutation.mutate(confirmReject.id)
          setConfirmReject(null)
        }}
        onCancel={() => setConfirmReject(null)}
      />

      {/* Discard one date / slot confirmation */}
      <ConfirmDialog
        open={!!rejectDateTarget}
        title="¿Descartar esta franja?"
        message={rejectDateTarget
          ? `${dateSlotLabel(rejectDateTarget.date)}. Los jugadores ya no podrán votarla.`
          : undefined}
        confirmLabel="Descartar"
        onConfirm={() => {
          if (rejectDateTarget) {
            rejectDateMutation.mutate({ proposalId: rejectDateTarget.proposal.id, dateId: rejectDateTarget.date.id })
          }
          setRejectDateTarget(null)
        }}
        onCancel={() => setRejectDateTarget(null)}
      />

      {/* Promote dialog */}
      {promoteTarget && (
        <PromoteDialog
          proposal={promoteTarget.proposal}
          date={promoteTarget.date}
          isPending={promoteDateMutation.isPending}
          error={promoteDateMutation.isError
            ? calendarError(promoteDateMutation.error, 'No se pudo promover la franja.', 'Esta franja ya estaba resuelta.')
            : null}
          onCancel={() => setPromoteTarget(null)}
          onConfirm={(form) =>
            promoteDateMutation.mutate({ proposalId: promoteTarget.proposal.id, dateId: promoteTarget.date.id, form })
          }
        />
      )}

      {/* Create sheet */}
      {showCreate && (
        <CreateProposalSheet
          onClose={() => setShowCreate(false)}
          onSubmit={(form) => createMutation.mutate(form)}
          isPending={createMutation.isPending}
          error={createMutation.isError ? calendarError(createMutation.error, 'No se pudo crear la propuesta.') : null}
        />
      )}
    </div>
  )
}
