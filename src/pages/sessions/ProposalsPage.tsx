import { useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, Check, Plus, X } from 'lucide-react'
import { proposalsApi } from '../../api/proposals'
import { useCampaignStore } from '../../store/campaignStore'
import {
  Button, ConfirmDialog, Disclosure, EmptyState, Field, IconButton, Input, PageHeader, SectionTitle, Sheet, Spinner,
} from '../../components/ui'
import { c, eyebrow, font, fs, page, pill, radius, tone, type Tone } from '../../theme'
import type { ProposalResponse, ProposalDateResponse } from '../../types'

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

const STATUS: Record<string, { label: string; tone: Tone }> = {
  Pending: { label: 'Abierta', tone: tone.brand },
  Promoted: { label: 'Confirmada', tone: tone.esmeralda },
  Rejected: { label: 'Rechazada', tone: tone.rubi },
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

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.Pending
  return (
    <span style={{
      ...pill(s.tone),
      fontFamily: font.ui, fontSize: fs.eyebrow, fontWeight: 700, letterSpacing: '0.08em',
      padding: '2px 8px', flexShrink: 0,
    }}>
      {s.label.toUpperCase()}
    </span>
  )
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

export function VoteBar({ date, isPending, onVote }: {
  date: ProposalDateResponse
  isPending: boolean
  onVote: (dateId: number, canAttend: boolean) => void
}) {
  const total = date.canCount + date.cannotCount
  const canPct = total > 0 ? (date.canCount / total) * 100 : 0
  const cannotPct = total > 0 ? (date.cannotCount / total) * 100 : 0

  const myVote = date.currentUserVote // null | true | false
  const dateLabel = sentenceCase(formatDate(date.proposedDate))
  const time = formatTime(date.proposedDate)

  return (
    <div role="group" aria-label={`${dateLabel}, ${time}`} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Date label */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <p style={{ minWidth: 0 }}>
          <span style={{ fontSize: fs.base, fontWeight: 650, color: c.text }}>
            {dateLabel}
          </span>
          <span style={{ fontSize: fs.sm, fontWeight: 550, color: c.muted, marginLeft: 8, fontVariantNumeric: 'tabular-nums' }}>
            {time}
          </span>
        </p>
        <span style={{ fontSize: fs.xs, color: c.subtle, fontVariantNumeric: 'tabular-nums' }}>
          {date.canCount + date.cannotCount === 0
            ? 'Sin votos'
            : `${date.canCount} sí · ${date.cannotCount} no`}
        </span>
      </div>

      {/* Vote bar (the counts above carry the same data for screen readers) */}
      {total > 0 && (
        <div aria-hidden style={{ display: 'flex', height: 6, borderRadius: radius.full, overflow: 'hidden', background: c.track }}>
          <div style={{ width: `${canPct}%`, background: tone.esmeralda.fg, transition: 'width 0.3s var(--ease-out)' }} />
          <div style={{ width: `${cannotPct}%`, background: tone.rubi.fg, transition: 'width 0.3s var(--ease-out)' }} />
        </div>
      )}

      {/* Vote buttons */}
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
    </div>
  )
}

function ProposalCard({
  proposal,
  isGm,
  onReject,
  onPromote,
  onVote,
  votePending,
}: {
  proposal: ProposalResponse
  isGm: boolean
  onReject: (p: ProposalResponse) => void
  onPromote: (p: ProposalResponse) => void
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
        {proposal.dates.map((d, idx) => (
          <div key={d.id}>
            {idx > 0 && <div aria-hidden style={{ height: 1, background: c.border, marginBottom: 16 }} />}
            <VoteBar
              date={d}
              isPending={votePending || !isPending}
              onVote={(dateId, canAttend) => onVote(proposal.id, dateId, canAttend)}
            />
          </div>
        ))}

        {/* GM actions */}
        {isGm && isPending && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
            <button type="button" className="ui-btn" onClick={() => onPromote(proposal)} style={toneButton(tone.esmeralda)}>
              Promover sesión
            </button>
            <Button variant="danger" onClick={() => onReject(proposal)}>
              Rechazar
            </Button>
          </div>
        )}
      </div>
    </Disclosure>
  )
}

// ─── promote dialog ──────────────────────────────────────────────────────────

export interface PromoteForm {
  proposalDateId: number | null
  title: string
  location: string
}

export function PromoteDialog({
  proposal,
  onConfirm,
  onCancel,
  isPending,
}: {
  proposal: ProposalResponse
  onConfirm: (form: PromoteForm) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [form, setForm] = useState<PromoteForm>({
    proposalDateId: null,
    title: proposal.title,
    location: '',
  })
  const groupLabelId = useId()
  const radios = useRef<(HTMLButtonElement | null)[]>([])

  const canSubmit = form.proposalDateId !== null && form.title.trim().length > 0

  const selectedIdx = proposal.dates.findIndex((d) => d.id === form.proposalDateId)
  const tabStop = selectedIdx >= 0 ? selectedIdx : 0
  const choose = (i: number) => setForm((f) => ({ ...f, proposalDateId: proposal.dates[i].id }))
  const onRadioKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'Tab') {
      // The radios are the first tab stop of the sheet. The shared focus trap counts the roving
      // tabindex=-1 radios as focusable, so Shift+Tab from a later selected radio would leave the modal:
      // wrap to the last control here instead.
      if (!e.shiftKey || e.defaultPrevented) return
      const dialog = e.currentTarget.closest<HTMLElement>('[role="dialog"]')
      if (!dialog) return
      const tabbables = Array.from(dialog.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex]'))
        .filter((el) => el.tabIndex >= 0 && !el.matches(':disabled') && el.offsetParent !== null)
      if (tabbables[0] !== e.currentTarget) return
      e.preventDefault()
      tabbables[tabbables.length - 1]?.focus()
      return
    }
    const count = proposal.dates.length
    let next = -1
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % count
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + count) % count
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = count - 1
    if (next < 0) return
    e.preventDefault()
    choose(next)
    radios.current[next]?.focus()
  }

  return (
    <Sheet
      open
      onClose={onCancel}
      title="Promover propuesta"
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
        {/* Date selection */}
        <div>
          <p id={groupLabelId} style={{ ...eyebrow, marginBottom: 8 }}>
            Selecciona la fecha confirmada
          </p>
          <div role="radiogroup" aria-labelledby={groupLabelId} aria-required="true" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {proposal.dates.map((d, i) => {
              const selected = form.proposalDateId === d.id
              return (
                <button
                  key={d.id}
                  ref={(el) => { radios.current[i] = el }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={i === tabStop ? 0 : -1}
                  onClick={() => choose(i)}
                  onKeyDown={(e) => onRadioKey(e, i)}
                  className={selected ? 'ui-btn' : 'ui-btn ui-btn--secondary'}
                  style={{
                    width: '100%', minHeight: 60, padding: '10px 14px', borderRadius: radius.md, cursor: 'pointer',
                    textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
                    border: `1px solid ${selected ? c.brand : c.borderBright}`,
                    boxShadow: selected ? `inset 0 0 0 1px ${c.brand}` : 'none',
                    background: selected ? 'var(--brand-bg)' : c.s2,
                    color: c.text,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${selected ? c.brand : c.borderStrong}`,
                      background: c.s1,
                      transition: 'border-color var(--dur-1)',
                    }}
                  >
                    {selected && <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.brand }} />}
                  </span>
                  <span style={{ display: 'block', minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: fs.base, fontWeight: 650, color: c.text }}>
                      {sentenceCase(formatDate(d.proposedDate))}
                    </span>
                    <span style={{ display: 'block', fontSize: fs.sm, color: c.muted, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(d.proposedDate)} · {d.canCount} pueden, {d.cannotCount} no pueden
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Title */}
        <Field label="Título de la sesión">
          <Input
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
      </div>
    </Sheet>
  )
}

// ─── create proposal sheet ───────────────────────────────────────────────────

export interface CreateForm {
  title: string
  notes: string
  dates: string[]
  times: string[]
}

export function CreateProposalSheet({
  onClose,
  onSubmit,
  isPending,
}: {
  onClose: () => void
  onSubmit: (form: CreateForm) => void
  isPending: boolean
}) {
  const [form, setForm] = useState<CreateForm>({
    title: '',
    notes: '',
    dates: [todayStr()],
    times: ['18:00'],
  })

  const addDate = () =>
    setForm((f) => ({ ...f, dates: [...f.dates, todayStr()], times: [...f.times, '18:00'] }))

  const removeDate = (idx: number) =>
    setForm((f) => ({
      ...f,
      dates: f.dates.filter((_, i) => i !== idx),
      times: f.times.filter((_, i) => i !== idx),
    }))

  const setDate = (idx: number, val: string) =>
    setForm((f) => { const d = [...f.dates]; d[idx] = val; return { ...f, dates: d } })

  const setTime = (idx: number, val: string) =>
    setForm((f) => { const t = [...f.times]; t[idx] = val; return { ...f, times: t } })

  const canSubmit = form.title.trim().length > 0 && form.dates.every((d) => d.length > 0)
  const removable = form.dates.length > 1

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

        {/* Proposed dates */}
        <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
          <legend style={{ ...eyebrow, padding: 0, marginBottom: 8 }}>
            Fechas propuestas
          </legend>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.dates.map((d, idx) => (
              <li
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: removable ? 'minmax(0, 1.7fr) minmax(0, 1fr) 44px' : 'minmax(0, 1.7fr) minmax(0, 1fr)',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Input
                  type="date"
                  aria-label={`Fecha ${idx + 1}`}
                  value={d}
                  onChange={(e) => setDate(idx, e.target.value)}
                  style={{ colorScheme: 'inherit', fontVariantNumeric: 'tabular-nums' }}
                />
                <Input
                  type="time"
                  aria-label={`Hora ${idx + 1}`}
                  value={form.times[idx]}
                  onChange={(e) => setTime(idx, e.target.value)}
                  style={{ colorScheme: 'inherit', fontVariantNumeric: 'tabular-nums' }}
                />
                {removable && (
                  <IconButton label={`Quitar fecha ${idx + 1}`} size={44} variant="danger" onClick={() => removeDate(idx)}>
                    <X size={18} aria-hidden />
                  </IconButton>
                )}
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={addDate}
            className="ui-btn ui-btn--ghost"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', minHeight: 44, marginTop: 8,
              background: 'transparent', border: `1px dashed ${c.borderStrong}`, borderRadius: radius.md,
              color: c.brand, fontSize: fs.sm + 1, fontWeight: 650, cursor: 'pointer',
            }}
          >
            <Plus size={16} aria-hidden /> Añadir fecha
          </button>
        </fieldset>
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
  const [promoteTarget, setPromoteTarget] = useState<ProposalResponse | null>(null)

  const { data: proposals = [], isLoading } = useQuery<ProposalResponse[]>({
    queryKey: ['proposals', cId],
    queryFn: () => proposalsApi.getAll(cId),
  })

  const createMutation = useMutation({
    mutationFn: (form: CreateForm) =>
      proposalsApi.create(cId, {
        title: form.title,
        notes: form.notes,
        proposedDates: form.dates.map((d, i) =>
          new Date(`${d}T${form.times[i]}:00`).toISOString()
        ),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals', cId] })
      setShowCreate(false)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (proposalId: number) => proposalsApi.reject(cId, proposalId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proposals', cId] }),
  })

  const promoteMutation = useMutation({
    mutationFn: ({ proposalId, form }: { proposalId: number; form: PromoteForm }) =>
      proposalsApi.promote(cId, proposalId, {
        proposalDateId: form.proposalDateId!,
        title: form.title,
        location: form.location,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals', cId] })
      qc.invalidateQueries({ queryKey: ['sessions', cId] })
      setPromoteTarget(null)
    },
  })

  const voteMutation = useMutation({
    mutationFn: ({ proposalId, dateId, canAttend }: { proposalId: number; dateId: number; canAttend: boolean }) =>
      proposalsApi.castVote(cId, proposalId, dateId, { canAttend }),
    onSuccess: (updated) => {
      qc.setQueryData<ProposalResponse[]>(['proposals', cId], (prev) =>
        prev ? prev.map((p) => (p.id === updated.id ? updated : p)) : [updated]
      )
    },
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
            onPromote={setPromoteTarget}
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
          <Button icon={<Plus size={16} aria-hidden />} onClick={() => setShowCreate(true)}>
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

      {/* Reject confirmation */}
      <ConfirmDialog
        open={!!confirmReject}
        title={`¿Rechazar "${confirmReject?.title}"?`}
        message="La propuesta se cerrará y los jugadores no podrán votar más."
        confirmLabel="Rechazar"
        onConfirm={() => {
          if (confirmReject) rejectMutation.mutate(confirmReject.id)
          setConfirmReject(null)
        }}
        onCancel={() => setConfirmReject(null)}
      />

      {/* Promote dialog */}
      {promoteTarget && (
        <PromoteDialog
          proposal={promoteTarget}
          isPending={promoteMutation.isPending}
          onCancel={() => setPromoteTarget(null)}
          onConfirm={(form) =>
            promoteMutation.mutate({ proposalId: promoteTarget.id, form })
          }
        />
      )}

      {/* Create sheet */}
      {showCreate && (
        <CreateProposalSheet
          onClose={() => setShowCreate(false)}
          onSubmit={(form) => createMutation.mutate(form)}
          isPending={createMutation.isPending}
        />
      )}
    </div>
  )
}
