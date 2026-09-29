import { useState, useMemo, useId, useRef, useEffect, type CSSProperties, type KeyboardEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Plus, X, Trash2, MapPin, Clock, CalendarDays, CalendarCheck, Lock } from 'lucide-react'
import { sessionsApi } from '../../api/sessions'
import { proposalsApi } from '../../api/proposals'
import { lockedDaysApi } from '../../api/lockedDays'
import { useCampaignStore } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import {
  Input, Spinner, ConfirmDialog, Button, IconButton, Card, Badge, Field,
  PageHeader, SectionTitle, EmptyState, Sheet,
} from '../../components/ui'
import { c, eyebrow, font, fs, numeral, page, radius, tint, tone } from '../../theme'
import type { Session, ProposalResponse, LockedDay } from '../../types'
import {
  StatusBadge,
  VoteBar,
  CreateProposalSheet,
  PromoteDialog,
} from './ProposalsPage'
import type { CreateForm, PromoteForm } from './ProposalsPage'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const WEEKDAYS_LONG = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isPast(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 'yyyy-MM-dd' (locked day) → "miércoles, 7 de octubre" */
function lockDateLong(dateKey: string) {
  return new Date(dateKey + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** ['Raito', 'Kaligula', 'Soul'] → "Raito, Kaligula y Soul" */
const namesList = new Intl.ListFormat('es', { style: 'long', type: 'conjunction' })

/** Controls that are in the tab order (used to keep focus in place after a row is removed) */
const TABBABLE = 'button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), a[href]'

/** Identity colour per player (by position among the campaign's players): one gem tone each, theme-aware. */
const PLAYER_COLORS = [
  'var(--rubi)', 'var(--heliodoro)', 'var(--topacio)', 'var(--esmeralda)',
  'var(--circon)', 'var(--zafiro)', 'var(--amatista)', 'var(--granate)',
]
const PLAYER_COLOR_FALLBACK = 'var(--cuarzo)'

interface SessionCreateForm {
  title: string
  date: string
  time: string
  location: string
  notes: string
}

/* ─── Local style fragments ─────────────────────────────────────────────── */

const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }

/** Card title (h3): Crimson Pro 600, like the book's talent boxes */
const cardTitle: CSSProperties = {
  fontFamily: font.display,
  fontSize: fs.lg,
  fontWeight: 600,
  lineHeight: 1.25,
  color: c.text,
}

const metaText: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  fontSize: fs.sm, color: c.muted, fontVariantNumeric: 'tabular-nums',
}

const inlineEmpty: CSSProperties = {
  padding: '18px 16px',
  borderRadius: radius.md,
  border: `1px dashed ${c.borderBright}`,
  background: 'color-mix(in srgb, var(--surface-1) 60%, transparent)',
  textAlign: 'center',
  fontSize: fs.sm + 1,
  color: c.muted,
}

/** Small square icon tile next to a card title */
const iconTile = (t: { fg: string; bg: string; border: string }, size = 36): CSSProperties => ({
  width: size, height: size, flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: radius.sm,
  background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
})

const rise = (i: number) => ({ '--i': i }) as CSSProperties

/** Date/time pickers follow the active theme (index.css forces `color-scheme: dark` on them, which
 *  makes the native calendar/clock glyphs almost invisible on paper). color-scheme is inherited from :root. */
const nativePickerScheme: CSSProperties = { colorScheme: 'inherit' }

// ─── Pending proposal card (always expanded, inline in calendar view) ─────────

function ProposalCalendarCard({
  proposal,
  isGm,
  onReject,
  onPromote,
  onVote,
  votePending,
}: {
  proposal: ProposalResponse
  isGm: boolean
  onReject: (p: ProposalResponse, trigger: HTMLElement) => void
  onPromote: (p: ProposalResponse, trigger: HTMLElement) => void
  onVote: (proposalId: number, dateId: number, canAttend: boolean) => void
  votePending: boolean
}) {
  return (
    <Card as="article" padding={0}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 12px' }}>
        <span aria-hidden style={iconTile(tone.brand)}>
          <CalendarDays size={18} />
        </span>
        <h3 style={{ ...cardTitle, flex: 1, minWidth: 0 }}>
          {proposal.title}
        </h3>
        <StatusBadge status={proposal.status} />
      </div>

      {proposal.notes && (
        <p style={{ fontSize: fs.sm + 1, color: c.muted, padding: '0 16px 12px', lineHeight: 1.5 }}>
          {proposal.notes}
        </p>
      )}

      {/* Dates with votes */}
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {proposal.dates.map((d, idx) => (
          <div key={d.id}>
            {idx > 0 && <div aria-hidden style={{ height: 1, background: c.border, marginBottom: 16 }} />}
            <VoteBar
              date={d}
              isPending={votePending}
              onVote={(dateId, canAttend) => onVote(proposal.id, dateId, canAttend)}
            />
          </div>
        ))}

        {/* GM actions (wrap onto two rows on narrow phones instead of overflowing the page) */}
        {isGm && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 16, borderTop: `1px solid ${c.border}` }}>
            <Button
              onClick={(e) => onPromote(proposal, e.currentTarget)}
              icon={<CalendarCheck size={16} aria-hidden />}
              style={{ flex: 1 }}
            >
              Promover sesión
            </Button>
            <Button
              variant="danger"
              onClick={(e) => onReject(proposal, e.currentTarget)}
              icon={<X size={16} aria-hidden />}
              style={{ flex: 1 }}
            >
              Rechazar
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function SessionsPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const qc = useQueryClient()
  const { isGm, currentCampaign } = useCampaignStore()
  const { user } = useAuthStore()
  const currentUserId = user?.id ?? 0
  const uid = useId()

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDayState] = useState<Date | null>(null)

  // Session create form
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Session | null>(null)
  const [form, setForm] = useState<SessionCreateForm>({
    title: '', date: '', time: '18:00', location: '', notes: '',
  })

  // Proposal modals
  const [showCreateProposal, setShowCreateProposal] = useState(false)
  const [confirmReject, setConfirmReject] = useState<ProposalResponse | null>(null)
  const [promoteTarget, setPromoteTarget] = useState<ProposalResponse | null>(null)

  // Lock days state
  const [lockNote, setLockNote] = useState('')
  const [showLockInput, setShowLockInput] = useState(false)
  const [confirmUnlock, setConfirmUnlock] = useState<LockedDay | null>(null)

  // Calendar keyboard navigation (roving tabindex) and focus restoration
  const [focusDay, setFocusDay] = useState<number | null>(null)
  const dayRefs = useRef<Record<number, HTMLButtonElement | null>>({})
  const refocusLockTrigger = useRef(false)
  /** Set once a lock is saved: the form (and its focused Confirmar) goes away, so focus the new "Día bloqueado" panel's button */
  const focusOwnLock = useRef(false)
  const pageRef = useRef<HTMLDivElement>(null)
  /** Button that opened the pending delete / unlock / reject / promote confirmation */
  const removalTrigger = useRef<HTMLElement | null>(null)
  /** Tab-order snapshot taken when that action was confirmed */
  const pendingRemoval = useRef<{ trigger: HTMLElement; items: HTMLElement[]; at: number } | null>(null)

  /** On confirm: remember where the trigger sits in the tab order (its row goes away once the list refetches) */
  const rememberRemoval = () => {
    const trigger = removalTrigger.current
    removalTrigger.current = null
    const items = Array.from(pageRef.current?.querySelectorAll<HTMLElement>(TABBABLE) ?? [])
    const at = trigger ? items.indexOf(trigger) : -1
    pendingRemoval.current = trigger && at >= 0 ? { trigger, items, at } : null
  }
  const askDelete = (s: Session, trigger: HTMLElement) => { removalTrigger.current = trigger; setConfirmDelete(s) }
  const askUnlock = (l: LockedDay, trigger: HTMLElement) => { removalTrigger.current = trigger; setConfirmUnlock(l) }
  const askReject = (p: ProposalResponse, trigger: HTMLElement) => { removalTrigger.current = trigger; setConfirmReject(p) }
  const askPromote = (p: ProposalResponse, trigger: HTMLElement) => { removalTrigger.current = trigger; setPromoteTarget(p) }

  // Once the row has gone, focus would fall to <body>: move it to the control that took its place
  // (the next one in tab order, else the previous one). Does nothing if focus is already somewhere.
  useEffect(() => {
    const r = pendingRemoval.current
    if (!r || r.trigger.isConnected) return
    pendingRemoval.current = null
    const active = document.activeElement
    if (active && active !== document.body) return
    const usable = (el: HTMLElement) => el.isConnected && !el.matches(':disabled')
    const target = r.items.slice(r.at + 1).find(usable) ?? r.items.slice(0, r.at).reverse().find(usable)
    target?.focus({ preventScroll: true })
  })

  /** Changing the selected day always closes the lock form and clears its note */
  const setSelectedDay = (day: Date | null) => {
    setSelectedDayState(day)
    setShowLockInput(false)
    setLockNote('')
    refocusLockTrigger.current = false
    focusOwnLock.current = false
  }

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ['sessions', cId],
    queryFn: () => sessionsApi.getAll(cId),
  })

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<ProposalResponse[]>({
    queryKey: ['proposals', cId],
    queryFn: () => proposalsApi.getAll(cId),
  })

  const { data: lockedDays = [] } = useQuery<LockedDay[]>({
    queryKey: ['locked-days', cId],
    queryFn: () => lockedDaysApi.getAll(cId),
  })

  const lockedByDate = useMemo(() => {
    const map = new Map<string, LockedDay[]>()
    for (const ld of lockedDays) {
      const arr = map.get(ld.date) ?? []
      arr.push(ld)
      map.set(ld.date, arr)
    }
    return map
  }, [lockedDays])

  const playerMembers = currentCampaign?.members.filter((m) => m.role === 'player') ?? []
  const playerColor = (userId: number) => {
    const idx = playerMembers.findIndex((m) => m.userId === userId)
    return PLAYER_COLORS[idx % PLAYER_COLORS.length] ?? PLAYER_COLOR_FALLBACK
  }

  // ── Session mutations ─────────────────────────────────────────────────────

  const createSessionMutation = useMutation({
    mutationFn: () => sessionsApi.create(cId, {
      title: form.title,
      date: new Date(`${form.date}T${form.time}:00`).toISOString(),
      location: form.location,
      notes: form.notes,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions', cId] })
      setShowCreate(false)
      setForm({ title: '', date: '', time: '18:00', location: '', notes: '' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (sessionId: number) => sessionsApi.delete(cId, sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions', cId] }),
  })

  // ── Proposal mutations ────────────────────────────────────────────────────

  const createProposalMutation = useMutation({
    mutationFn: (createForm: CreateForm) =>
      proposalsApi.create(cId, {
        title: createForm.title,
        notes: createForm.notes,
        proposedDates: createForm.dates.map((d, i) =>
          new Date(`${d}T${createForm.times[i]}:00`).toISOString()
        ),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals', cId] })
      setShowCreateProposal(false)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (proposalId: number) => proposalsApi.reject(cId, proposalId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proposals', cId] }),
  })

  const promoteMutation = useMutation({
    mutationFn: ({ proposalId, promoteForm }: { proposalId: number; promoteForm: PromoteForm }) =>
      proposalsApi.promote(cId, proposalId, {
        proposalDateId: promoteForm.proposalDateId!,
        title: promoteForm.title,
        location: promoteForm.location,
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

  const addLockMutation = useMutation({
    mutationFn: ({ date, note }: { date: string; note: string }) =>
      lockedDaysApi.add(cId, { date, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locked-days', cId] })
      setLockNote('')
      setShowLockInput(false)
    },
  })

  const removeLockMutation = useMutation({
    mutationFn: (lockedDayId: number) => lockedDaysApi.remove(cId, lockedDayId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['locked-days', cId] }),
  })

  // ── Calendar logic ────────────────────────────────────────────────────────

  const firstDay = new Date(viewYear, viewMonth, 1)
  const lastDay = new Date(viewYear, viewMonth + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7
  const cells: (Date | null)[] = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1
    cells.push(dayNum >= 1 && dayNum <= lastDay.getDate() ? new Date(viewYear, viewMonth, dayNum) : null)
  }
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const sessionsByDay = (day: Date) =>
    sessions.filter((s) => isSameDay(new Date(s.date), day))

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelectedDay(null)
  }

  const selectedSessions = selectedDay ? sessionsByDay(selectedDay) : []

  const openCreate = (day?: Date) => {
    const d = day ?? today
    const pad = (n: number) => String(n).padStart(2, '0')
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    setForm((f) => ({ ...f, date: dateStr }))
    setShowCreate(true)
  }

  const pendingProposals = proposals.filter((p) => p.status === 'Pending')

  // Roving tabindex: one day of the grid is in the tab order; arrows move between days.
  const daysInMonth = lastDay.getDate()
  const isViewMonth = (d: Date) => d.getFullYear() === viewYear && d.getMonth() === viewMonth
  const defaultFocusDay = selectedDay && isViewMonth(selectedDay)
    ? selectedDay.getDate()
    : isViewMonth(today) ? today.getDate() : 1
  const tabbableDay = focusDay !== null && focusDay <= daysInMonth ? focusDay : defaultFocusDay

  const onDayKeyDown = (e: KeyboardEvent<HTMLButtonElement>, dayNum: number, weekdayIdx: number) => {
    let next: number
    switch (e.key) {
      case 'ArrowLeft': next = dayNum - 1; break
      case 'ArrowRight': next = dayNum + 1; break
      case 'ArrowUp': next = dayNum - 7; break
      case 'ArrowDown': next = dayNum + 7; break
      case 'Home': next = dayNum - weekdayIdx; break
      case 'End': next = dayNum + (6 - weekdayIdx); break
      default: return
    }
    e.preventDefault()
    next = Math.min(Math.max(next, 1), daysInMonth)
    setFocusDay(next)
    dayRefs.current[next]?.focus()
  }

  // Players who blocked a day in the visible month (GM legend: colour is never the only cue)
  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-`
  const monthLockers: { userId: number; name: string }[] = []
  for (const l of lockedDays) {
    if (l.date.startsWith(monthPrefix) && !monthLockers.some((m) => m.userId === l.userId)) {
      monthLockers.push({ userId: l.userId, name: l.userDisplayName })
    }
  }

  const ids = {
    month: `${uid}-month`,
    day: `${uid}-day`,
    proposals: `${uid}-proposals`,
    locks: `${uid}-locks`,
    upcoming: `${uid}-upcoming`,
    past: `${uid}-past`,
  }

  if (sessionsLoading || proposalsLoading) return <Spinner />

  // ── Selected day: lock section ────────────────────────────────────────────

  const renderLockSection = (day: Date) => {
    const dayKey = toDateKey(day)
    const dayLocks = lockedByDate.get(dayKey) ?? []

    if (isGm) {
      if (dayLocks.length === 0) return null
      return (
        <Card padding={16}>
          <h3 style={{ ...cardTitle, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Lock size={16} aria-hidden style={{ color: tone.rubi.fg }} />
            Días bloqueados
          </h3>
          <ul style={{ ...listReset, gap: 0 }}>
            {dayLocks.map((l, i) => (
              <li
                key={l.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, minHeight: 52,
                  borderTop: i > 0 ? `1px solid ${c.border}` : undefined,
                }}
              >
                <span aria-hidden style={{ width: 10, height: 10, borderRadius: '50%', background: playerColor(l.userId), flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, padding: '8px 0' }}>
                  <p style={{ fontSize: fs.base, fontWeight: 650, color: c.text, lineHeight: 1.3 }}>{l.userDisplayName}</p>
                  {l.note && (
                    <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 2, lineHeight: 1.45 }}>{l.note}</p>
                  )}
                </div>
                <IconButton
                  label={`Desbloquear día de ${l.userDisplayName}`}
                  variant="danger"
                  size={44}
                  onClick={(e) => askUnlock(l, e.currentTarget)}
                  style={{ marginRight: -8 }}
                >
                  <Trash2 size={18} aria-hidden />
                </IconButton>
              </li>
            ))}
          </ul>
        </Card>
      )
    }

    // Player view
    const ownLock = dayLocks.find((l) => l.userId === currentUserId)

    if (ownLock) {
      return (
        <div
          ref={(el) => {
            if (el && focusOwnLock.current) { focusOwnLock.current = false; el.querySelector('button')?.focus() }
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 8px 12px 14px', borderRadius: radius.lg,
            background: tone.rubi.bg, border: `1px solid ${tone.rubi.border}`,
          }}
        >
          <span aria-hidden style={iconTile(tone.rubi)}>
            <Lock size={18} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: fs.base, fontWeight: 650, color: tone.rubi.fg, lineHeight: 1.3 }}>Día bloqueado</p>
            {ownLock.note && (
              <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 2, lineHeight: 1.45 }}>{ownLock.note}</p>
            )}
          </div>
          <IconButton
            label="Desbloquear día"
            variant="danger"
            size={44}
            onClick={(e) => askUnlock(ownLock, e.currentTarget)}
            disabled={removeLockMutation.isPending}
          >
            <Trash2 size={18} aria-hidden />
          </IconButton>
        </div>
      )
    }

    if (isPast(day)) return null

    if (!showLockInput) {
      return (
        <button
          type="button"
          ref={(el) => {
            if (el && refocusLockTrigger.current) { refocusLockTrigger.current = false; el.focus() }
          }}
          onClick={() => setShowLockInput(true)}
          className="ui-row"
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%', minHeight: 52,
            padding: '0 16px', borderRadius: radius.lg, cursor: 'pointer', textAlign: 'left',
            background: 'transparent', border: `1px dashed ${c.borderStrong}`,
            color: c.muted, fontSize: fs.base - 1, fontWeight: 600,
          }}
        >
          <Lock size={16} aria-hidden />
          Bloquear este día
        </button>
      )
    }

    return (
      <Card padding={16}>
        <h3 style={{ ...cardTitle, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Lock size={16} aria-hidden style={{ color: tone.rubi.fg }} />
          Bloquear este día
        </h3>
        <Field label="Motivo (opcional)">
          <Input
            autoFocus
            placeholder="Motivo (opcional)..."
            value={lockNote}
            onChange={(e) => setLockNote(e.target.value)}
          />
        </Field>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button
            variant="secondary"
            style={{ flex: 1 }}
            onClick={() => { refocusLockTrigger.current = true; setShowLockInput(false); setLockNote('') }}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            style={{ flex: 1 }}
            icon={<Lock size={16} aria-hidden />}
            loading={addLockMutation.isPending}
            onClick={() => addLockMutation.mutate(
              { date: dayKey, note: lockNote },
              { onSuccess: () => { focusOwnLock.current = true } },
            )}
          >
            {addLockMutation.isPending ? 'Guardando...' : 'Confirmar'}
          </Button>
        </div>
      </Card>
    )
  }

  // ── Bottom list data (when no day selected) ───────────────────────────────

  const upcoming = sessions
    .filter((s) => !isPast(new Date(s.date)))
    .slice(0, 5)
  const pastSessions = sessions
    .filter((s) => isPast(new Date(s.date)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
  const upcomingLocks = lockedDays.filter((l) => !isPast(new Date(l.date + 'T00:00:00')))

  return (
    <div ref={pageRef} style={page}>

      <PageHeader
        title="Calendario"
        actions={isGm ? (
          <>
            <Button icon={<Plus size={16} aria-hidden />} onClick={() => openCreate()} aria-label="Nueva sesión">
              Sesión
            </Button>
            <Button variant="secondary" icon={<Plus size={16} aria-hidden />} onClick={() => setShowCreateProposal(true)} aria-label="Nueva propuesta">
              Propuesta
            </Button>
          </>
        ) : undefined}
      />

      {/* Month calendar */}
      <Card as="section" padding={0} aria-labelledby={ids.month} style={{ overflow: 'hidden' }}>
        {/* Month navigator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 8 }}>
          <IconButton label="Mes anterior" size={44} onClick={prevMonth}>
            <ChevronLeft size={20} aria-hidden />
          </IconButton>
          <h2
            id={ids.month}
            aria-live="polite"
            style={{ fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, lineHeight: 1.2, color: c.text, textAlign: 'center' }}
          >
            {MONTHS[viewMonth]} {viewYear}
          </h2>
          <IconButton label="Mes siguiente" size={44} onClick={nextMonth}>
            <ChevronRight size={20} aria-hidden />
          </IconButton>
        </div>

        {/* Calendar grid */}
        <table role="grid" aria-labelledby={ids.month} style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {WEEKDAYS.map((d, i) => (
                <th
                  key={d}
                  scope="col"
                  abbr={WEEKDAYS_LONG[i]}
                  style={{
                    ...eyebrow, letterSpacing: '0.08em', textAlign: 'center', padding: '8px 0',
                    borderTop: `1px solid ${c.border}`,
                    color: i >= 5 ? c.muted : c.subtle,
                  }}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, w) => (
              <tr key={w}>
                {week.map((day, i) => {
                  const cellStyle: CSSProperties = {
                    padding: 0,
                    verticalAlign: 'top',
                    borderTop: `1px solid ${c.border}`,
                    borderLeft: i > 0 ? `1px solid ${c.border}` : undefined,
                  }
                  if (!day) {
                    return <td key={i} style={{ ...cellStyle, background: 'color-mix(in srgb, var(--surface-2) 70%, transparent)' }} />
                  }
                  const dayNum = day.getDate()
                  const daySessions = sessionsByDay(day)
                  const isToday = isSameDay(day, today)
                  const past = isPast(day)
                  const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
                  const dayLocks = lockedByDate.get(toDateKey(day)) ?? []
                  const ownLocked = !isGm && dayLocks.some((l) => l.userId === currentUserId)

                  const labelParts = [`${WEEKDAYS_LONG[i]} ${dayNum} de ${MONTHS[viewMonth].toLowerCase()}`]
                  if (isToday) labelParts.push('hoy')
                  if (daySessions.length > 0) labelParts.push(`${daySessions.length} ${daySessions.length === 1 ? 'sesión' : 'sesiones'}`)
                  if (isGm && dayLocks.length > 0) labelParts.push(`bloqueado por ${namesList.format(dayLocks.map((l) => l.userDisplayName))}`)
                  if (ownLocked) labelParts.push('bloqueado')

                  return (
                    <td key={i} style={cellStyle}>
                      <button
                        type="button"
                        ref={(el) => { dayRefs.current[dayNum] = el }}
                        tabIndex={dayNum === tabbableDay ? 0 : -1}
                        aria-pressed={isSelected}
                        aria-current={isToday ? 'date' : undefined}
                        aria-label={labelParts.join(', ')}
                        onClick={() => setSelectedDay(isSelected ? null : day)}
                        onKeyDown={(e) => onDayKeyDown(e, dayNum, i)}
                        onFocus={() => setFocusDay(dayNum)}
                        className={isSelected ? undefined : 'ui-row'}
                        style={{
                          width: '100%',
                          height: 'clamp(60px, 9vw, 76px)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          padding: '6px 2px',
                          border: 'none',
                          borderRadius: 0,
                          cursor: 'pointer',
                          background: isSelected ? 'var(--brand-bg)' : 'transparent',
                          boxShadow: isSelected ? 'inset 0 0 0 2px var(--brand-border)' : 'none',
                          outlineOffset: -3,
                        }}
                      >
                        <span
                          style={{
                            width: 28, height: 28, flexShrink: 0, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: font.ui, fontSize: fs.sm + 1, lineHeight: 1,
                            fontVariantNumeric: 'tabular-nums',
                            fontWeight: isToday ? 750 : isSelected ? 700 : 550,
                            background: isToday ? c.brandFill : 'transparent',
                            color: isToday ? c.onBrand : isSelected ? c.brandLight : past ? c.subtle : c.text,
                          }}
                        >
                          {dayNum}
                        </span>
                        <span aria-hidden style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: '100%' }}>
                          {daySessions.slice(0, 2).map((s) => (
                            <span
                              key={s.id}
                              style={{
                                width: '70%', maxWidth: 44, height: 4, borderRadius: radius.full,
                                background: isPast(new Date(s.date)) ? tint('var(--cuarzo)', 55) : c.brand,
                              }}
                            />
                          ))}
                          {daySessions.length > 2 && (
                            <span style={{ fontSize: fs.xs, fontWeight: 650, lineHeight: 1, color: c.subtle }}>+{daySessions.length - 2}</span>
                          )}
                          {ownLocked && <Lock size={12} strokeWidth={2.4} style={{ color: tone.rubi.fg }} />}
                          {isGm && dayLocks.length > 0 && (
                            <span style={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                              {dayLocks.slice(0, 4).map((l) => (
                                <span key={l.id} style={{ width: 6, height: 6, borderRadius: '50%', background: playerColor(l.userId) }} />
                              ))}
                            </span>
                          )}
                        </span>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* GM legend: which player each lock colour belongs to */}
        {isGm && monthLockers.length > 0 && (
          <div
            style={{
              display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px 16px',
              padding: '12px 16px', borderTop: `1px solid ${c.border}`,
            }}
          >
            <p style={eyebrow}>Días bloqueados</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
              {monthLockers.map((m) => (
                <li key={m.userId} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: fs.sm, color: c.muted }}>
                  <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: playerColor(m.userId) }} />
                  {m.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Selected day sessions */}
      {selectedDay && (
        <section aria-labelledby={ids.day} className="fade-in" style={{ marginTop: 32 }}>
          <SectionTitle
            id={ids.day}
            action={isGm ? (
              <Button
                size="sm"
                variant="secondary"
                icon={<Plus size={14} aria-hidden />}
                onClick={() => openCreate(selectedDay)}
                aria-label="Añadir sesión este día"
              >
                Añadir
              </Button>
            ) : undefined}
          >
            {selectedDay.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </SectionTitle>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedSessions.length === 0 ? (
              <p style={inlineEmpty}>No hay sesiones este día</p>
            ) : (
              <ul style={listReset}>
                {selectedSessions.map((s, i) => (
                  <li key={s.id} className="rise" style={rise(i)}>
                    <SessionCard session={s} isGm={isGm} onDelete={(trigger) => askDelete(s, trigger)} />
                  </li>
                ))}
              </ul>
            )}

            {/* Lock section */}
            {renderLockSection(selectedDay)}
          </div>
        </section>
      )}

      {/* Bottom list (when no day selected) */}
      {!selectedDay && (
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Pending proposals — shown first */}
          {pendingProposals.length > 0 && (
            <section aria-labelledby={ids.proposals}>
              <SectionTitle id={ids.proposals}>Propuestas abiertas</SectionTitle>
              <ul style={listReset}>
                {pendingProposals.map((p, i) => (
                  <li key={p.id} className="rise" style={rise(i)}>
                    <ProposalCalendarCard
                      proposal={p}
                      isGm={isGm}
                      onReject={askReject}
                      onPromote={askPromote}
                      onVote={(proposalId, dateId, canAttend) =>
                        voteMutation.mutate({ proposalId, dateId, canAttend })
                      }
                      votePending={voteMutation.isPending}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!isGm && upcomingLocks.length > 0 && (
            <section aria-labelledby={ids.locks}>
              <SectionTitle id={ids.locks}>Mis días bloqueados</SectionTitle>
              <Card padding={0}>
                <ul style={{ ...listReset, gap: 0 }}>
                  {upcomingLocks.map((l, i) => (
                    <li
                      key={l.id}
                      className="rise"
                      style={{
                        ...rise(i),
                        display: 'flex', alignItems: 'center', gap: 12,
                        minHeight: 60, padding: '8px 8px 8px 14px',
                        borderTop: i > 0 ? `1px solid ${c.border}` : undefined,
                      }}
                    >
                      <span aria-hidden style={iconTile(tone.rubi, 32)}>
                        <Lock size={15} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: fs.base - 1, fontWeight: 650, color: c.text, lineHeight: 1.3 }}>
                          {new Date(l.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                        {l.note && (
                          <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 2, lineHeight: 1.45 }}>{l.note}</p>
                        )}
                      </div>
                      <IconButton
                        label={`Desbloquear el ${lockDateLong(l.date)}`}
                        variant="danger"
                        size={44}
                        onClick={(e) => askUnlock(l, e.currentTarget)}
                        disabled={removeLockMutation.isPending}
                      >
                        <Trash2 size={18} aria-hidden />
                      </IconButton>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          {upcoming.length > 0 && (
            <section aria-labelledby={ids.upcoming}>
              <SectionTitle id={ids.upcoming}>Próximas sesiones</SectionTitle>
              <ul style={listReset}>
                {upcoming.map((s, i) => (
                  <li key={s.id} className="rise" style={rise(i)}>
                    <SessionCard session={s} isGm={isGm} onDelete={(trigger) => askDelete(s, trigger)} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {pastSessions.length > 0 && (
            <section aria-labelledby={ids.past}>
              <SectionTitle id={ids.past}>Últimas sesiones</SectionTitle>
              <ul style={listReset}>
                {pastSessions.map((s, i) => (
                  <li key={s.id} className="rise" style={rise(i)}>
                    <SessionCard session={s} isGm={isGm} onDelete={(trigger) => askDelete(s, trigger)} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {sessions.length === 0 && pendingProposals.length === 0 && (
            <EmptyState
              icon={<CalendarDays size={24} aria-hidden />}
              title="No hay sesiones registradas todavía"
            />
          )}
        </div>
      )}

      {/* Delete session confirmation */}
      <ConfirmDialog
        open={!!confirmDelete}
        title={`¿Eliminar "${confirmDelete?.title}"?`}
        message="Esta acción no se puede deshacer."
        onConfirm={() => { rememberRemoval(); deleteMutation.mutate(confirmDelete!.id); setConfirmDelete(null) }}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Reject proposal confirmation */}
      <ConfirmDialog
        open={!!confirmReject}
        title={`¿Rechazar "${confirmReject?.title}"?`}
        message="La propuesta se cerrará y los jugadores no podrán votar más."
        confirmLabel="Rechazar"
        onConfirm={() => { if (confirmReject) { rememberRemoval(); rejectMutation.mutate(confirmReject.id) } setConfirmReject(null) }}
        onCancel={() => setConfirmReject(null)}
      />

      {/* Unlock day confirmation (GM or player) */}
      <ConfirmDialog
        open={!!confirmUnlock}
        title="¿Desbloquear este día?"
        message={confirmUnlock
          ? confirmUnlock.userId === currentUserId
            ? `Volverás a estar disponible el ${lockDateLong(confirmUnlock.date)}.`
            : `${confirmUnlock.userDisplayName} volverá a estar disponible el ${lockDateLong(confirmUnlock.date)}.`
          : undefined}
        confirmLabel="Desbloquear"
        onConfirm={() => {
          if (confirmUnlock) {
            // Player unlocking the selected (future) day: its trash disappears, so focus the "Bloquear este día" button that replaces it
            if (!isGm && selectedDay && !isPast(selectedDay) && confirmUnlock.date === toDateKey(selectedDay)) {
              refocusLockTrigger.current = true
            }
            rememberRemoval()
            removeLockMutation.mutate(confirmUnlock.id)
          }
          setConfirmUnlock(null)
        }}
        onCancel={() => setConfirmUnlock(null)}
      />

      {/* Promote dialog */}
      {promoteTarget && (
        <PromoteDialog
          proposal={promoteTarget}
          isPending={promoteMutation.isPending}
          onCancel={() => setPromoteTarget(null)}
          onConfirm={(promoteForm) => {
            rememberRemoval()
            promoteMutation.mutate({ proposalId: promoteTarget.id, promoteForm })
          }}
        />
      )}

      {/* Create session sheet */}
      <Sheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nueva sesión"
        footer={
          <Button
            size="lg"
            fullWidth
            onClick={() => createSessionMutation.mutate()}
            disabled={!form.title || !form.date || createSessionMutation.isPending}
            loading={createSessionMutation.isPending}
          >
            {createSessionMutation.isPending ? 'Guardando...' : 'Crear sesión'}
          </Button>
        }
      >
        <IconButton
          label="Cerrar"
          size={44}
          onClick={() => setShowCreate(false)}
          style={{ position: 'absolute', top: 12, right: 12 }}
        >
          <X size={20} aria-hidden />
        </IconButton>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
          <Field label="Título">
            <Input
              data-autofocus
              placeholder="Nombre de la sesión..."
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Fecha">
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                style={nativePickerScheme}
              />
            </Field>
            <Field label="Hora">
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                style={nativePickerScheme}
              />
            </Field>
          </div>

          <Field label="Lugar">
            <Input
              placeholder="Lugar de la sesión..."
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </Field>

          <Field label="Notas">
            <Input
              placeholder="Notas opcionales..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </Field>
        </div>
      </Sheet>

      {/* Create proposal sheet */}
      {showCreateProposal && (
        <CreateProposalSheet
          onClose={() => setShowCreateProposal(false)}
          onSubmit={(createForm) => createProposalMutation.mutate(createForm)}
          isPending={createProposalMutation.isPending}
        />
      )}
    </div>
  )
}

// ─── Session card ─────────────────────────────────────────────────────────────

function SessionCard({ session, isGm, onDelete }: { session: Session; isGm: boolean; onDelete: (trigger: HTMLElement) => void }) {
  const date = new Date(session.date)
  const past = isPast(date)

  return (
    <Card as="article" padding={14} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      {/* Date tile */}
      <time
        dateTime={session.date}
        style={{
          flexShrink: 0, width: 54, padding: '9px 0 8px', textAlign: 'center',
          borderRadius: radius.md,
          background: past ? c.s2 : 'var(--brand-bg)',
          border: `1px solid ${past ? c.border : 'var(--brand-border)'}`,
        }}
      >
        <span style={{ ...numeral, display: 'block', fontSize: fs.xl, color: past ? c.muted : c.brandLight }}>
          {date.getDate()}
        </span>
        <span style={{ ...eyebrow, display: 'block', marginTop: 5, color: past ? c.subtle : c.brand }}>
          {date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
        </span>
      </time>

      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <h3 style={{ ...cardTitle, color: past ? c.muted : c.text, overflowWrap: 'anywhere' }}>
          {session.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px 12px', flexWrap: 'wrap', marginTop: 6 }}>
          {past ? (
            <Badge style={{ fontSize: fs.eyebrow, letterSpacing: '0.08em' }}>PASADA</Badge>
          ) : (
            <Badge variant="success" style={{ fontSize: fs.eyebrow, letterSpacing: '0.08em' }}>PLANIFICADA</Badge>
          )}
          <span style={metaText}>
            <Clock size={14} aria-hidden />
            {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {session.location && (
            <span style={metaText}>
              <MapPin size={14} aria-hidden />
              {session.location}
            </span>
          )}
        </div>
        {session.notes && (
          <p style={{ fontSize: fs.sm + 1, color: c.muted, marginTop: 8, lineHeight: 1.5 }}>
            {session.notes}
          </p>
        )}
      </div>

      {isGm && (
        <IconButton
          label={`Eliminar sesión ${session.title}`}
          variant="danger"
          size={44}
          onClick={(e) => onDelete(e.currentTarget)}
          style={{ marginTop: -4, marginRight: -4 }}
        >
          <Trash2 size={18} aria-hidden />
        </IconButton>
      )}
    </Card>
  )
}
