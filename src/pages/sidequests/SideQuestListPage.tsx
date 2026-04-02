import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ArrowRight, Play, Pause, ScrollText } from 'lucide-react'
import { sideQuestsApi } from '../../api/sidequests'
import { useCampaignStore } from '../../store/campaignStore'
import { Input, Spinner, ConfirmDialog } from '../../components/ui'

function QuestCard({
  quest,
  isGm,
  onOpen,
  onDelete,
  onToggle,
}: {
  quest: { id: number; name: string; summary?: string; started: boolean }
  isGm: boolean
  onOpen: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 14px', borderRadius: 16, cursor: 'pointer',
        background: 'var(--surface-1)',
        border: `1px solid ${hovered ? 'rgba(180,190,254,0.2)' : 'var(--border)'}`,
        transform: hovered ? 'translateX(3px)' : 'translateX(0)',
        boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.2)' : 'none',
        transition: 'transform 0.18s cubic-bezier(.22,.68,0,1.2), box-shadow 0.18s ease, border-color 0.18s ease',
      }}
    >
      {/* Status dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: quest.started ? '#34d399' : 'var(--text-subtle)',
        boxShadow: quest.started ? '0 0 8px rgba(52,211,153,0.6)' : 'none',
        transition: 'all 0.2s',
      }} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: quest.summary ? 3 : 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
            {quest.name}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' as const,
            padding: '2px 6px', borderRadius: 20, flexShrink: 0,
            ...(quest.started
              ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-subtle)' })
          }}>
            {quest.started ? 'Activa' : 'Pendiente'}
          </span>
        </div>
        {quest.summary && (
          <p style={{
            fontSize: 12, color: 'var(--text-subtle)',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>
            {quest.summary}
          </p>
        )}
      </div>

      {/* Actions */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {isGm && (
          <>
            <button
              onClick={onToggle}
              title={quest.started ? 'Pausar misión' : 'Activar misión'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '5px',
                borderRadius: 7, color: 'var(--text-subtle)',
                opacity: hovered ? 1 : 0.4,
                transition: 'opacity 0.15s, color 0.15s', display: 'flex',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
            >
              {quest.started ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button
              onClick={onDelete}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '5px',
                borderRadius: 7, color: 'var(--text-subtle)',
                opacity: hovered ? 1 : 0.4,
                transition: 'opacity 0.15s, color 0.15s', display: 'flex',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
        <ArrowRight
          size={14}
          style={{
            color: hovered ? 'var(--brand-light)' : 'var(--text-subtle)',
            transform: hovered ? 'translateX(2px)' : 'translateX(0)',
            transition: 'transform 0.18s cubic-bezier(.22,.68,0,1.2), color 0.15s',
          }}
        />
      </div>
    </div>
  )
}

export function SideQuestListPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const id = Number(campaignId)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isGm } = useCampaignStore()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null; name: string }>({ open: false, id: null, name: '' })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (creating) setTimeout(() => inputRef.current?.focus(), 50) }, [creating])
  const closeModal = () => { setCreating(false); setNewName('') }

  const { data: quests, isLoading } = useQuery({
    queryKey: ['sidequests', id],
    queryFn: () => sideQuestsApi.getAll(id),
  })

  const createMutation = useMutation({
    mutationFn: () => sideQuestsApi.create(id, { name: newName }),
    onSuccess: (q) => {
      qc.invalidateQueries({ queryKey: ['sidequests', id] })
      closeModal()
      navigate(`/campaigns/${id}/sidequests/${q.id}`, { state: { editing: true } })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ qId, quest }: { qId: number; quest: any }) =>
      sideQuestsApi.update(id, qId, { ...quest, started: !quest.started }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sidequests', id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (qId: number) => sideQuestsApi.delete(id, qId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sidequests', id] }),
  })

  if (isLoading) return <Spinner />

  const active = quests?.filter((q) => q.started) ?? []
  const pending = quests?.filter((q) => !q.started) ?? []

  return (
    <div style={{ padding: '28px 20px 48px', maxWidth: 640 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 3 }}>
            Misiones
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {quests?.length
              ? `${active.length} activa${active.length !== 1 ? 's' : ''} · ${pending.length} pendiente${pending.length !== 1 ? 's' : ''}`
              : 'Aún no hay misiones'}
          </p>
        </div>
        {isGm && (
          <button
            onClick={() => setCreating(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
              color: 'white', border: 'none', borderRadius: 10, padding: '8px 14px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(139,92,246,0.35)', flexShrink: 0,
            }}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Nueva misión</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        )}
      </div>

      {/* Bottom-sheet modal */}
      {creating && (
        <>
          <div onClick={closeModal} style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          }} />
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 51,
            background: 'var(--surface-1)',
            borderTop: '1px solid var(--border-bright)',
            borderRadius: '20px 20px 0 0',
            padding: '8px 20px 32px',
            boxShadow: '0 -16px 48px rgba(0,0,0,0.4)',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 4, background: 'var(--surface-3)', margin: '8px auto 20px' }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Nueva misión</h2>
            <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 20 }}>
              Después podrás añadir descripción, actos y recompensas.
            </p>
            <Input
              ref={inputRef}
              placeholder="Nombre de la misión..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newName.trim() && createMutation.mutate()}
              style={{ marginBottom: 14, fontSize: 15 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={closeModal} style={{
                flex: 1, padding: '11px', borderRadius: 12,
                background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
                color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>Cancelar</button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!newName.trim() || createMutation.isPending}
                style={{
                  flex: 2, padding: '11px',
                  background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                  color: 'white', border: 'none', borderRadius: 12,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  opacity: !newName.trim() || createMutation.isPending ? 0.5 : 1,
                  boxShadow: '0 2px 12px rgba(139,92,246,0.4)',
                }}
              >{createMutation.isPending ? 'Creando...' : 'Crear misión'}</button>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {quests?.length === 0 && (
        <div style={{
          border: '1.5px dashed var(--border-bright)', borderRadius: 20,
          padding: '52px 32px', textAlign: 'center', background: 'var(--surface-1)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 16px',
            background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ScrollText size={20} style={{ color: 'var(--text-subtle)' }} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Sin misiones todavía</h3>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: isGm ? 24 : 0 }}>
            {isGm ? 'Crea la primera misión secundaria.' : 'No hay misiones activas todavía.'}
          </p>
          {isGm && (
            <button
              onClick={() => setCreating(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                color: 'white', border: 'none', borderRadius: 10, padding: '8px 20px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(139,92,246,0.3)',
              }}
            >
              <Plus size={13} /> Crear misión
            </button>
          )}
        </div>
      )}

      {/* Active quests */}
      {active.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#34d399', letterSpacing: '0.08em', marginBottom: 10 }}>
            ACTIVAS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {active.map((q) => (
              <QuestCard key={q.id} quest={q} isGm={isGm}
                onOpen={() => navigate(`/campaigns/${id}/sidequests/${q.id}`)}
                onDelete={() => setConfirmDelete({ open: true, id: q.id, name: q.name })}
                onToggle={() => toggleMutation.mutate({ qId: q.id, quest: q })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending quests */}
      {pending.length > 0 && (
        <div>
          {active.length > 0 && (
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 10 }}>
              PENDIENTES
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pending.map((q) => (
              <QuestCard key={q.id} quest={q} isGm={isGm}
                onOpen={() => navigate(`/campaigns/${id}/sidequests/${q.id}`)}
                onDelete={() => setConfirmDelete({ open: true, id: q.id, name: q.name })}
                onToggle={() => toggleMutation.mutate({ qId: q.id, quest: q })}
              />
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        title={`¿Eliminar "${confirmDelete.name}"?`}
        message="Esta acción no se puede deshacer."
        onConfirm={() => { deleteMutation.mutate(confirmDelete.id!); setConfirmDelete({ open: false, id: null, name: '' }) }}
        onCancel={() => setConfirmDelete({ open: false, id: null, name: '' })}
      />
    </div>
  )
}
