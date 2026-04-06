import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, MessageSquare, Check } from 'lucide-react'
import { notesApi } from '../../api/notes'
import { useCampaignStore } from '../../store/campaignStore'
import { Spinner } from '../../components/ui'
import type { CampaignDetail } from '../../types'

export function GmMessagesPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const qc = useQueryClient()
  const { currentCampaign } = useCampaignStore()

  const players = (currentCampaign as CampaignDetail | null)?.members?.filter((m) => m.role === 'player') ?? []

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const [content, setContent] = useState('')

  const { data: sentNotes = [], isLoading } = useQuery({
    queryKey: ['notes', cId],
    queryFn: () => notesApi.getAll(cId),
  })

  const sendMutation = useMutation({
    mutationFn: () => notesApi.create(cId, { toUserId: selectedPlayerId!, content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes', cId] })
      setContent('')
    },
  })

  if (isLoading) return <Spinner />

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 48px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>
          Mensajes
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Envía notas privadas a los jugadores
        </p>
      </div>

      {/* Send form */}
      <div style={{
        background: 'var(--surface-1)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '16px', marginBottom: 28,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 10 }}>
          DESTINATARIO
        </div>

        {players.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 14 }}>
            No hay jugadores en la campaña todavía.
          </p>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {players.map((p) => (
              <button
                key={p.userId}
                onClick={() => setSelectedPlayerId(selectedPlayerId === p.userId ? null : p.userId)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 12px', borderRadius: 10, cursor: 'pointer',
                  border: `1px solid ${selectedPlayerId === p.userId ? 'rgba(180,190,254,0.3)' : 'var(--border)'}`,
                  background: selectedPlayerId === p.userId ? 'rgba(180,190,254,0.1)' : 'var(--surface-2)',
                  color: selectedPlayerId === p.userId ? 'var(--brand-light)' : 'var(--text-muted)',
                  fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#7c3aed,#6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700, color: 'white',
                }}>
                  {p.displayName[0].toUpperCase()}
                </div>
                {p.displayName}
              </button>
            ))}
          </div>
        )}

        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 8 }}>
          MENSAJE
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe un mensaje privado..."
          rows={3}
          style={{
            width: '100%', resize: 'vertical',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 12px',
            color: 'var(--text)', fontSize: 14, lineHeight: 1.5,
            outline: 'none', boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(180,190,254,0.3)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />

        <button
          onClick={() => sendMutation.mutate()}
          disabled={!selectedPlayerId || !content.trim() || sendMutation.isPending}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            marginTop: 10, padding: '9px 16px',
            background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
            color: 'white', border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            opacity: !selectedPlayerId || !content.trim() || sendMutation.isPending ? 0.5 : 1,
            boxShadow: '0 2px 10px rgba(139,92,246,0.35)',
            transition: 'opacity 0.15s',
          }}
        >
          <Send size={13} />
          {sendMutation.isPending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>

      {/* Sent history */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 10 }}>
        ENVIADOS
      </div>

      {sentNotes.length === 0 ? (
        <div style={{
          border: '1.5px dashed var(--border-bright)', borderRadius: 20,
          padding: '52px 32px', textAlign: 'center', background: 'var(--surface-1)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 16px',
            background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageSquare size={20} style={{ color: 'var(--text-subtle)' }} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Sin mensajes enviados
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>
            Los mensajes que envíes aparecerán aquí.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sentNotes.map((note) => (
            <div
              key={note.id}
              style={{
                background: 'var(--surface-1)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: 'var(--brand-light)',
                  background: 'rgba(180,190,254,0.1)', border: '1px solid rgba(180,190,254,0.15)',
                  borderRadius: 6, padding: '2px 8px',
                }}>
                  → {note.toDisplayName}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {note.isRead && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#34d399', fontWeight: 600 }}>
                      <Check size={10} /> Leído
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                    {new Date(note.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
