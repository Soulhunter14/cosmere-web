import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck } from 'lucide-react'
import { notesApi } from '../../api/notes'
import { Spinner } from '../../components/ui'

export function NotasPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const qc = useQueryClient()

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', cId],
    queryFn: () => notesApi.getAll(cId),
  })

  const markReadMutation = useMutation({
    mutationFn: (noteId: number) => notesApi.markAsRead(cId, noteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', cId] }),
  })

  if (isLoading) return <Spinner />

  const unread = notes.filter((n) => !n.isRead)
  const read = notes.filter((n) => n.isRead)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 48px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>
          Notas
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {unread.length > 0
            ? `${unread.length} nota${unread.length !== 1 ? 's' : ''} sin leer`
            : 'Todo al día'}
        </p>
      </div>

      {notes.length === 0 ? (
        <div style={{
          border: '1.5px dashed var(--border-bright)', borderRadius: 20,
          padding: '52px 32px', textAlign: 'center', background: 'var(--surface-1)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 16px',
            background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bell size={20} style={{ color: 'var(--text-subtle)' }} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Sin notas todavía
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>
            El GM puede enviarte notas privadas aquí.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Unread */}
          {unread.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-light)', letterSpacing: '0.08em', marginBottom: 10 }}>
                SIN LEER
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {unread.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      background: 'var(--surface-1)',
                      border: '1px solid rgba(180,190,254,0.2)',
                      borderLeft: '3px solid var(--brand-light)',
                      borderRadius: 14, padding: '14px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-light)' }}>
                        {note.fromDisplayName}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                        {new Date(note.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, margin: '0 0 12px' }}>
                      {note.content}
                    </p>
                    <button
                      onClick={() => markReadMutation.mutate(note.id)}
                      disabled={markReadMutation.isPending}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                        background: 'rgba(180,190,254,0.1)', border: '1px solid rgba(180,190,254,0.2)',
                        color: 'var(--brand-light)', fontSize: 12, fontWeight: 600,
                        transition: 'opacity 0.15s',
                        opacity: markReadMutation.isPending ? 0.5 : 1,
                      }}
                    >
                      <CheckCheck size={12} />
                      Marcar como leída
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Read */}
          {read.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 10 }}>
                LEÍDAS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {read.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      background: 'var(--surface-1)', border: '1px solid var(--border)',
                      borderRadius: 14, padding: '14px 16px', opacity: 0.7,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                        {note.fromDisplayName}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                        {new Date(note.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
