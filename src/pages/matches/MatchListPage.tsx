import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ArrowRight, CheckCircle2, Clock3 } from 'lucide-react'
import { matchesApi } from '../../api/matches'
import { useCampaignStore } from '../../store/campaignStore'
import { Spinner, ConfirmDialog } from '../../components/ui'

export function MatchListPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const id = Number(campaignId)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isGm } = useCampaignStore()
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches', id],
    queryFn: () => matchesApi.getAll(id),
  })

  const createMutation = useMutation({
    mutationFn: () => matchesApi.create(id),
    onSuccess: (m) => {
      qc.invalidateQueries({ queryKey: ['matches', id] })
      navigate(`/campaigns/${id}/matches/${m.id}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (matchId: number) => matchesApi.delete(id, matchId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches', id] }),
  })

  if (isLoading) return <Spinner />

  return (
    <div style={{ padding: '20px 16px 48px', maxWidth: 680, margin: '0 auto' }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{
            fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em',
            color: 'var(--text)', marginBottom: 4, lineHeight: 1.2,
          }}>
            Sesiones
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {matches?.length === 0
              ? 'Sin sesiones registradas'
              : `${matches?.length ?? 0} sesión${(matches?.length ?? 0) !== 1 ? 'es' : ''} registrada${(matches?.length ?? 0) !== 1 ? 's' : ''}`}
          </p>
        </div>

        {isGm && (
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
              color: 'white', border: 'none', borderRadius: 12,
              padding: '8px 14px', fontSize: 13, fontWeight: 600,
              cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: createMutation.isPending ? 0.5 : 1,
              boxShadow: '0 4px 14px rgba(139,92,246,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (!createMutation.isPending) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,92,246,0.45)' } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(139,92,246,0.3)' }}
          >
            <Plus size={14} />
            Nueva sesión
          </button>
        )}
      </div>

      {/* ── Empty state ───────────────────────────────────────── */}
      {matches?.length === 0 && (
        <div style={{
          border: '1.5px dashed var(--border-bright)',
          borderRadius: 20,
          padding: '52px 32px',
          textAlign: 'center',
          background: 'var(--surface-1)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 16px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border-bright)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Clock3 size={20} style={{ color: 'var(--text-subtle)' }} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Sin sesiones todavía
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)', maxWidth: 260, margin: '0 auto' }}>
            {isGm ? 'Inicia la primera sesión de la campaña' : 'El GM aún no ha iniciado ninguna sesión'}
          </p>
        </div>
      )}

      {/* ── Match list ────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {matches?.map((m) => {
          const hovered = hoveredId === m.id
          return (
            <div
              key={m.id}
              onClick={() => navigate(`/campaigns/${id}/matches/${m.id}`)}
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                borderRadius: 16,
                border: `1px solid ${hovered ? 'rgba(139,92,246,0.25)' : 'var(--border)'}`,
                background: hovered ? 'var(--surface-2)' : 'var(--surface-1)',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s, transform 0.15s',
                transform: hovered ? 'translateX(3px)' : 'translateX(0)',
              }}
            >
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>

                {/* Status icon */}
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  background: m.isCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  border: m.isCompleted ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(245,158,11,0.2)',
                }}>
                  {m.isCompleted
                    ? <CheckCircle2 size={16} style={{ color: '#34d399' }} />
                    : <Clock3 size={16} style={{ color: '#fbbf24' }} />}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                      Sesión #{m.id}
                    </span>
                    <span
                      style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                        padding: '2px 8px', borderRadius: 20,
                        background: m.isCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        border: m.isCompleted ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(245,158,11,0.2)',
                        color: m.isCompleted ? '#34d399' : '#fbbf24',
                      }}
                    >
                      {m.isCompleted ? 'Completada' : 'En curso'}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                    {new Date(m.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })} · {m.scenes.length} escena{m.scenes.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Actions */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isGm && (
                    <button
                      onClick={() => setConfirmDelete({ open: true, id: m.id })}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
                        borderRadius: 8, color: 'var(--text-subtle)',
                        opacity: hovered ? 1 : 0.4,
                        transition: 'opacity 0.15s, color 0.15s',
                        display: 'flex', alignItems: 'center',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  <ArrowRight
                    size={15}
                    style={{
                      color: hovered ? 'var(--brand-light)' : 'var(--text-subtle)',
                      transition: 'color 0.15s, transform 0.2s',
                      transform: hovered ? 'translateX(2px)' : 'translateX(0)',
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={confirmDelete.open}
        title="¿Eliminar esta sesión?"
        message="Se eliminarán también todas sus escenas. Esta acción no se puede deshacer."
        onConfirm={() => { deleteMutation.mutate(confirmDelete.id!); setConfirmDelete({ open: false, id: null }) }}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </div>
  )
}
