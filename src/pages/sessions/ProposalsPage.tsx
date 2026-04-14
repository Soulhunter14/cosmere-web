import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { proposalsApi } from '../../api/proposals'
import { useCampaignStore } from '../../store/campaignStore'
import { Input, Spinner, ConfirmDialog } from '../../components/ui'
import type { ProposalResponse, ProposalDateResponse } from '../../types'

// ─── helpers ────────────────────────────────────────────────────────────────

export function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function todayStr() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// ─── sub-components ─────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    Pending: { label: 'Abierta', color: 'var(--brand-light)', bg: 'rgba(180,190,254,0.1)', border: 'rgba(180,190,254,0.25)' },
    Promoted: { label: 'Confirmada', color: '#86efac', bg: 'rgba(134,239,172,0.1)', border: 'rgba(134,239,172,0.25)' },
    Rejected: { label: 'Rechazada', color: '#fb7185', bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.25)' },
  }
  const s = map[status] ?? map.Pending
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 5, padding: '2px 6px',
    }}>
      {s.label.toUpperCase()}
    </span>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Date label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>
            {formatDate(date.proposedDate)}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-subtle)', marginLeft: 8 }}>
            {formatTime(date.proposedDate)}
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
          {date.canCount + date.cannotCount === 0
            ? 'Sin votos'
            : `${date.canCount} sí · ${date.cannotCount} no`}
        </span>
      </div>

      {/* Vote bar */}
      {total > 0 && (
        <div style={{ display: 'flex', height: 5, borderRadius: 3, overflow: 'hidden', background: 'var(--surface-3)' }}>
          <div style={{ width: `${canPct}%`, background: '#86efac', transition: 'width 0.3s' }} />
          <div style={{ width: `${cannotPct}%`, background: '#fb7185', transition: 'width 0.3s' }} />
        </div>
      )}

      {/* Vote buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onVote(date.id, true)}
          disabled={isPending}
          style={{
            flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer',
            fontSize: 12, fontWeight: 700,
            border: myVote === true ? '1.5px solid #86efac' : '1px solid var(--border)',
            background: myVote === true ? 'rgba(134,239,172,0.12)' : 'var(--surface-2)',
            color: myVote === true ? '#86efac' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'all 0.15s',
          }}
        >
          {myVote === true && <Check size={11} />}
          Puedo
        </button>
        <button
          onClick={() => onVote(date.id, false)}
          disabled={isPending}
          style={{
            flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer',
            fontSize: 12, fontWeight: 700,
            border: myVote === false ? '1.5px solid #fb7185' : '1px solid var(--border)',
            background: myVote === false ? 'rgba(251,113,133,0.1)' : 'var(--surface-2)',
            color: myVote === false ? '#fb7185' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'all 0.15s',
          }}
        >
          {myVote === false && <X size={11} />}
          No puedo
        </button>
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
  const [expanded, setExpanded] = useState(proposal.status === 'Pending')
  const isPending = proposal.status === 'Pending'

  return (
    <div style={{
      background: 'var(--surface-1)', border: '1px solid var(--border)',
      borderRadius: 14, overflow: 'hidden',
      borderLeft: `3px solid ${isPending ? 'var(--brand-light)' : proposal.status === 'Promoted' ? '#86efac' : '#fb7185'}`,
    }}>
      {/* Card header */}
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', cursor: 'pointer' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{proposal.title}</span>
            <StatusBadge status={proposal.status} />
          </div>
          {proposal.notes && (
            <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 3, lineHeight: 1.4 }}>
              {proposal.notes}
            </p>
          )}
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 4 }}>
            {proposal.dates.length} fecha{proposal.dates.length !== 1 ? 's' : ''} propuesta{proposal.dates.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ color: 'var(--text-subtle)', flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded dates */}
      {expanded && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {proposal.dates.map((d, idx) => (
            <div key={d.id}>
              {idx > 0 && <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />}
              <VoteBar
                date={d}
                isPending={votePending || !isPending}
                onVote={(dateId, canAttend) => onVote(proposal.id, dateId, canAttend)}
              />
            </div>
          ))}

          {/* GM actions */}
          {isGm && isPending && (
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                onClick={() => onPromote(proposal)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 9, cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                  background: 'rgba(134,239,172,0.12)', border: '1.5px solid rgba(134,239,172,0.3)',
                  color: '#86efac',
                }}
              >
                Promover sesión
              </button>
              <button
                onClick={() => onReject(proposal)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 9, cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                  background: 'rgba(251,113,133,0.08)', border: '1.5px solid rgba(251,113,133,0.2)',
                  color: '#fb7185',
                }}
              >
                Rechazar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
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

  const canSubmit = form.proposalDateId !== null && form.title.trim().length > 0

  return (
    <>
      <div
        onClick={onCancel}
        style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 81,
        background: 'var(--surface-1)', borderRadius: '20px 20px 0 0',
        border: '1px solid var(--border-bright)', borderBottom: 'none',
        paddingBottom: 'calc(20px + var(--sab, 0px))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Promover propuesta</span>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Date selection */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em', marginBottom: 8 }}>
              SELECCIONA LA FECHA CONFIRMADA
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {proposal.dates.map((d) => {
                const selected = form.proposalDateId === d.id
                return (
                  <button
                    key={d.id}
                    onClick={() => setForm((f) => ({ ...f, proposalDateId: d.id }))}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                      border: selected ? '1.5px solid var(--brand-light)' : '1px solid var(--border)',
                      background: selected ? 'rgba(180,190,254,0.1)' : 'var(--surface-2)',
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      border: selected ? '5px solid var(--brand-light)' : '1.5px solid var(--border)',
                      background: selected ? 'var(--brand-light)' : 'transparent',
                      transition: 'all 0.15s',
                    }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>
                        {formatDate(d.proposedDate)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                        {formatTime(d.proposedDate)} · {d.canCount} pueden, {d.cannotCount} no pueden
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em', marginBottom: 6 }}>
              TÍTULO DE LA SESIÓN
            </div>
            <Input
              placeholder="Nombre de la sesión..."
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Location */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em', marginBottom: 6 }}>
              LUGAR (opcional)
            </div>
            <Input
              placeholder="Lugar de la sesión..."
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>

          <button
            onClick={() => canSubmit && onConfirm(form)}
            disabled={!canSubmit || isPending}
            style={{
              background: 'var(--brand)', border: 'none', borderRadius: 12,
              color: 'white', fontSize: 14, fontWeight: 700,
              padding: '13px', cursor: canSubmit ? 'pointer' : 'default', marginTop: 4,
              opacity: !canSubmit ? 0.5 : 1,
            }}
          >
            {isPending ? 'Confirmando...' : 'Confirmar sesión'}
          </button>
        </div>
      </div>
    </>
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

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71,
        background: 'var(--surface-1)', borderRadius: '20px 20px 0 0',
        border: '1px solid var(--border-bright)', borderBottom: 'none',
        maxHeight: '92vh', overflow: 'auto',
        paddingBottom: 'calc(20px + var(--sab, 0px))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Nueva propuesta</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Title */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em', marginBottom: 6 }}>TÍTULO</div>
            <Input
              placeholder="Ej: ¿Cuándo jugamos en mayo?"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Notes */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em', marginBottom: 6 }}>NOTAS (opcional)</div>
            <Input
              placeholder="Información adicional..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {/* Proposed dates */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em', marginBottom: 8 }}>
              FECHAS PROPUESTAS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.dates.map((d, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 2 }}>
                    <Input
                      type="date"
                      value={d}
                      onChange={(e) => setDate(idx, e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input
                      type="time"
                      value={form.times[idx]}
                      onChange={(e) => setTime(idx, e.target.value)}
                    />
                  </div>
                  {form.dates.length > 1 && (
                    <button
                      onClick={() => removeDate(idx)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-subtle)', padding: 4, flexShrink: 0,
                      }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addDate}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: '1px dashed var(--border)',
                borderRadius: 8, color: 'var(--text-subtle)',
                fontSize: 12, fontWeight: 600, padding: '8px 14px',
                cursor: 'pointer', marginTop: 8, width: '100%', justifyContent: 'center',
              }}
            >
              <Plus size={13} /> Añadir fecha
            </button>
          </div>

          <button
            onClick={() => canSubmit && onSubmit(form)}
            disabled={!canSubmit || isPending}
            style={{
              background: 'var(--brand)', border: 'none', borderRadius: 12,
              color: 'white', fontSize: 14, fontWeight: 700,
              padding: '13px', cursor: canSubmit ? 'pointer' : 'default', marginTop: 4,
              opacity: !canSubmit ? 0.5 : 1,
            }}
          >
            {isPending ? 'Creando...' : 'Crear propuesta'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export function ProposalsPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const qc = useQueryClient()
  const { isGm } = useCampaignStore()

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

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 48px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>
          Propuestas
        </h1>
        {isGm && (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--brand)', border: 'none', borderRadius: 10,
              color: 'white', fontSize: 12, fontWeight: 700,
              padding: '8px 14px', cursor: 'pointer',
            }}
          >
            <Plus size={13} />
            Nueva propuesta
          </button>
        )}
      </div>

      {proposals.length === 0 ? (
        <div style={{
          background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '40px 20px', textAlign: 'center',
          color: 'var(--text-subtle)', fontSize: 13,
        }}>
          {isGm
            ? 'Crea una propuesta de fecha para que los jugadores voten.'
            : 'No hay propuestas de fecha todavía.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {pending.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 10 }}>
                ABIERTAS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pending.map((p) => (
                  <ProposalCard
                    key={p.id}
                    proposal={p}
                    isGm={isGm}
                    onReject={setConfirmReject}
                    onPromote={setPromoteTarget}
                    onVote={(proposalId, dateId, canAttend) =>
                      voteMutation.mutate({ proposalId, dateId, canAttend })
                    }
                    votePending={voteMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {resolved.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 10 }}>
                RESUELTAS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {resolved.map((p) => (
                  <ProposalCard
                    key={p.id}
                    proposal={p}
                    isGm={isGm}
                    onReject={setConfirmReject}
                    onPromote={setPromoteTarget}
                    onVote={(proposalId, dateId, canAttend) =>
                      voteMutation.mutate({ proposalId, dateId, canAttend })
                    }
                    votePending={voteMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject confirmation */}
      <ConfirmDialog
        open={!!confirmReject}
        title={`¿Rechazar "${confirmReject?.title}"?`}
        message="La propuesta se cerrará y los jugadores no podrán votar más."
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
