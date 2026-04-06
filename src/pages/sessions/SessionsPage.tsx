import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Plus, X, Trash2, MapPin, Clock } from 'lucide-react'
import { sessionsApi } from '../../api/sessions'
import { useCampaignStore } from '../../store/campaignStore'
import { Input, Spinner, ConfirmDialog } from '../../components/ui'
import type { Session } from '../../types'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
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

interface CreateForm {
  title: string
  date: string
  time: string
  location: string
  notes: string
}

export function SessionsPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const qc = useQueryClient()
  const { isGm } = useCampaignStore()

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Session | null>(null)
  const [form, setForm] = useState<CreateForm>({
    title: '', date: '', time: '18:00', location: '', notes: '',
  })

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ['sessions', cId],
    queryFn: () => sessionsApi.getAll(cId),
  })

  const createMutation = useMutation({
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

  // Build calendar grid (Mon-start)
  const firstDay = new Date(viewYear, viewMonth, 1)
  const lastDay = new Date(viewYear, viewMonth + 1, 0)
  // Mon=0 ... Sun=6
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7
  const cells: (Date | null)[] = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1
    cells.push(dayNum >= 1 && dayNum <= lastDay.getDate() ? new Date(viewYear, viewMonth, dayNum) : null)
  }

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

  if (isLoading) return <Spinner />

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 48px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>
          Calendario
        </h1>
        {isGm && (
          <button
            onClick={() => openCreate()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--brand)', border: 'none', borderRadius: 10,
              color: 'white', fontSize: 12, fontWeight: 700,
              padding: '8px 14px', cursor: 'pointer',
            }}
          >
            <Plus size={13} />
            Nueva sesión
          </button>
        )}
      </div>

      {/* Month navigator */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface-1)', border: '1px solid var(--border)',
        borderRadius: '14px 14px 0 0', padding: '12px 16px',
      }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 4 }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 4 }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        background: 'var(--surface-1)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
      }}>
        {WEEKDAYS.map((d) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 9, fontWeight: 700,
            color: 'var(--text-subtle)', letterSpacing: '0.06em',
            padding: '6px 0', borderBottom: '1px solid var(--border)',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        background: 'var(--border)', gap: 1,
        border: '1px solid var(--border)', borderTop: 'none',
        borderRadius: '0 0 14px 14px', overflow: 'hidden',
      }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} style={{ background: 'var(--surface-2)', minHeight: 56 }} />
          const daySessions = sessionsByDay(day)
          const isToday = isSameDay(day, today)
          const past = isPast(day)
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false

          return (
            <div
              key={idx}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              style={{
                background: isSelected ? 'rgba(180,190,254,0.1)' : 'var(--surface-1)',
                minHeight: 56, padding: '6px 4px', cursor: 'pointer',
                borderLeft: isSelected ? '2px solid var(--brand-light)' : '2px solid transparent',
                transition: 'background 0.1s',
              }}
            >
              {/* Day number */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                <span style={{
                  fontSize: 11, fontWeight: isToday ? 800 : 500,
                  color: isToday ? 'white' : past ? 'var(--text-subtle)' : 'var(--text-muted)',
                  background: isToday ? 'var(--brand)' : 'transparent',
                  borderRadius: '50%', width: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {day.getDate()}
                </span>
              </div>
              {/* Session dots */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                {daySessions.slice(0, 2).map((s) => (
                  <div key={s.id} style={{
                    width: '90%', height: 4, borderRadius: 2,
                    background: isPast(new Date(s.date)) ? 'rgba(148,163,184,0.5)' : 'var(--brand-light)',
                  }} />
                ))}
                {daySessions.length > 2 && (
                  <span style={{ fontSize: 8, color: 'var(--text-subtle)' }}>+{daySessions.length - 2}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected day sessions */}
      {selectedDay && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
              {selectedDay.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            {isGm && (
              <button
                onClick={() => openCreate(selectedDay)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text-muted)', fontSize: 11, fontWeight: 600,
                  padding: '5px 10px', cursor: 'pointer',
                }}
              >
                <Plus size={11} /> Añadir
              </button>
            )}
          </div>

          {selectedSessions.length === 0 ? (
            <div style={{
              background: 'var(--surface-1)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '20px', textAlign: 'center',
              color: 'var(--text-subtle)', fontSize: 13,
            }}>
              No hay sesiones este día
            </div>
          ) : (
            selectedSessions.map((s) => <SessionCard key={s.id} session={s} isGm={isGm} onDelete={() => setConfirmDelete(s)} />)
          )}
        </div>
      )}

      {/* Upcoming sessions list */}
      {!selectedDay && (() => {
        const upcoming = sessions
          .filter((s) => !isPast(new Date(s.date)))
          .slice(0, 5)
        const past = sessions
          .filter((s) => isPast(new Date(s.date)))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3)

        return (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {upcoming.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 8 }}>
                  PRÓXIMAS SESIONES
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {upcoming.map((s) => <SessionCard key={s.id} session={s} isGm={isGm} onDelete={() => setConfirmDelete(s)} />)}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 8 }}>
                  ÚLTIMAS SESIONES
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {past.map((s) => <SessionCard key={s.id} session={s} isGm={isGm} onDelete={() => setConfirmDelete(s)} />)}
                </div>
              </div>
            )}
            {sessions.length === 0 && (
              <div style={{
                background: 'var(--surface-1)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '32px', textAlign: 'center',
                color: 'var(--text-subtle)', fontSize: 13,
              }}>
                No hay sesiones registradas todavía
              </div>
            )}
          </div>
        )
      })()}

      <ConfirmDialog
        open={!!confirmDelete}
        title={`¿Eliminar "${confirmDelete?.title}"?`}
        message="Esta acción no se puede deshacer."
        onConfirm={() => { deleteMutation.mutate(confirmDelete!.id); setConfirmDelete(null) }}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Create session sheet */}
      {showCreate && (
        <>
          <div
            onClick={() => setShowCreate(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71,
            background: 'var(--surface-1)', borderRadius: '20px 20px 0 0',
            border: '1px solid var(--border-bright)', borderBottom: 'none',
            paddingBottom: 'calc(20px + var(--sab, 0px))',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Nueva sesión</span>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em', marginBottom: 6 }}>TÍTULO</div>
                <Input
                  placeholder="Nombre de la sesión..."
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em', marginBottom: 6 }}>FECHA</div>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em', marginBottom: 6 }}>HORA</div>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em', marginBottom: 6 }}>LUGAR</div>
                <Input
                  placeholder="Lugar de la sesión..."
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em', marginBottom: 6 }}>NOTAS</div>
                <Input
                  placeholder="Notas opcionales..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>

              <button
                onClick={() => createMutation.mutate()}
                disabled={!form.title || !form.date || createMutation.isPending}
                style={{
                  background: 'var(--brand)', border: 'none', borderRadius: 12,
                  color: 'white', fontSize: 14, fontWeight: 700,
                  padding: '13px', cursor: 'pointer', marginTop: 4,
                  opacity: !form.title || !form.date ? 0.5 : 1,
                }}
              >
                {createMutation.isPending ? 'Guardando...' : 'Crear sesión'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function SessionCard({ session, isGm, onDelete }: { session: Session; isGm: boolean; onDelete: () => void }) {
  const date = new Date(session.date)
  const past = isPast(date)

  return (
    <div style={{
      background: 'var(--surface-1)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '12px 14px',
      borderLeft: `3px solid ${past ? 'rgba(148,163,184,0.4)' : 'var(--brand-light)'}`,
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      {/* Date block */}
      <div style={{
        flexShrink: 0, textAlign: 'center',
        background: past ? 'var(--surface-2)' : 'rgba(180,190,254,0.08)',
        border: `1px solid ${past ? 'var(--border)' : 'rgba(180,190,254,0.2)'}`,
        borderRadius: 10, padding: '6px 10px', minWidth: 44,
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: past ? 'var(--text-subtle)' : 'var(--brand-light)', lineHeight: 1 }}>
          {date.getDate()}
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.04em', marginTop: 2 }}>
          {date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: past ? 'var(--text-muted)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session.title}
          </span>
          {past ? (
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>
              PASADA
            </span>
          ) : (
            <span style={{ fontSize: 9, fontWeight: 700, color: '#86efac', background: 'rgba(134,239,172,0.1)', border: '1px solid rgba(134,239,172,0.2)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>
              PLANIFICADA
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-subtle)' }}>
            <Clock size={10} />
            {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {session.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-subtle)' }}>
              <MapPin size={10} />
              {session.location}
            </span>
          )}
        </div>
        {session.notes && (
          <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4, lineHeight: 1.4 }}>
            {session.notes}
          </p>
        )}
      </div>

      {/* Delete */}
      {isGm && (
        <button
          onClick={onDelete}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-subtle)', padding: 4, flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  )
}
