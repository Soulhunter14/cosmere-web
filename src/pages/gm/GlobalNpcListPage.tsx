import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ArrowRight, BookOpen } from 'lucide-react'
import { globalNpcsApi } from '../../api/global-npcs'
import { useCampaignStore } from '../../store/campaignStore'
import { Input, Spinner, ConfirmDialog } from '../../components/ui'
import type { GlobalNpc } from '../../types'

function GlobalNpcCard({
  npc,
  isGm,
  onOpen,
  onDelete,
}: {
  npc: GlobalNpc
  isGm: boolean
  onOpen: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
        background: 'var(--surface-1)',
        border: `1px solid ${hovered ? 'rgba(248,113,113,0.2)' : 'var(--border)'}`,
        transform: hovered ? 'translateX(3px)' : 'translateX(0)',
        boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.2)' : 'none',
        transition: 'transform 0.18s cubic-bezier(.22,.68,0,1.2), box-shadow 0.18s ease, border-color 0.18s ease',
      }}
    >
      {/* Avatar / image */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg,#7f1d1d,#991b1b)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 800, color: 'white',
        overflow: 'hidden',
      }}>
        {npc.imageUrl
          ? <img src={npc.imageUrl} alt={npc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : npc.name[0].toUpperCase()
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
            {npc.name}
          </span>
          {npc.tipo && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20,
              letterSpacing: '0.04em', textTransform: 'uppercase' as const,
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171',
            }}>
              {npc.tipo}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {npc.source && (
            <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 500 }}>
              {npc.source}
            </span>
          )}
          {npc.ascendencia && (
            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>· {npc.ascendencia}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {isGm && (
          <button
            onClick={onDelete}
            title="Eliminar"
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
        )}
        <ArrowRight
          size={14}
          style={{
            color: hovered ? '#f87171' : 'var(--text-subtle)',
            transform: hovered ? 'translateX(2px)' : 'translateX(0)',
            transition: 'transform 0.18s cubic-bezier(.22,.68,0,1.2), color 0.15s',
          }}
        />
      </div>
    </div>
  )
}

export function GlobalNpcListPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isGm } = useCampaignStore()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null; name: string }>({ open: false, id: null, name: '' })
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: npcs, isLoading } = useQuery({
    queryKey: ['global-npcs'],
    queryFn: globalNpcsApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: () => globalNpcsApi.create({ name: newName }),
    onSuccess: (npc) => {
      qc.invalidateQueries({ queryKey: ['global-npcs'] })
      setCreating(false)
      setNewName('')
      navigate(`/campaigns/${campaignId}/global-npcs/${npc.id}`, { state: { editing: true } })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => globalNpcsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['global-npcs'] }),
  })

  if (isLoading) return <Spinner />

  return (
    <div style={{ padding: '20px 16px 48px', maxWidth: 680, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>
            NPCs
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {npcs?.length
              ? `${npcs.length} adversario${npcs.length !== 1 ? 's' : ''} del libro`
              : 'Sin adversarios todavía'}
          </p>
        </div>

        {isGm && (
          <button
            onClick={() => { setCreating(true); setTimeout(() => inputRef.current?.focus(), 50) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'linear-gradient(135deg,#ef4444,#b91c1c)',
              color: 'white', border: 'none',
              borderRadius: 10, padding: '8px 14px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(239,68,68,0.35)', flexShrink: 0,
            }}
          >
            <Plus size={14} />
            Nuevo
          </button>
        )}
      </div>

      {/* Bottom-sheet create modal */}
      {creating && (
        <>
          <div onClick={() => { setCreating(false); setNewName('') }} style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
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
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Nuevo NPC</h2>
            <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 20 }}>
              Añade un adversario del libro de reglas.
            </p>
            <Input
              ref={inputRef}
              placeholder="Nombre del adversario..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newName.trim() && createMutation.mutate()}
              style={{ marginBottom: 14, fontSize: 15 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setCreating(false); setNewName('') }}
                style={{
                  flex: 1, padding: '11px', borderRadius: 12,
                  background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
                  color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >Cancelar</button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!newName.trim() || createMutation.isPending}
                style={{
                  flex: 2, padding: '11px',
                  background: 'linear-gradient(135deg,#ef4444,#b91c1c)',
                  color: 'white', border: 'none', borderRadius: 12,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  opacity: !newName.trim() || createMutation.isPending ? 0.5 : 1,
                }}
              >{createMutation.isPending ? 'Creando...' : 'Crear NPC'}</button>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {npcs?.length === 0 && (
        <div style={{
          border: '1.5px dashed var(--border-bright)', borderRadius: 20,
          padding: '52px 32px', textAlign: 'center', background: 'var(--surface-1)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 16px',
            background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={20} style={{ color: 'var(--text-subtle)' }} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Sin adversarios todavía</h3>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: isGm ? 24 : 0 }}>
            {isGm ? 'Importa adversarios del libro de reglas.' : 'No hay adversarios disponibles.'}
          </p>
        </div>
      )}

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {npcs?.map((npc) => (
          <GlobalNpcCard
            key={npc.id}
            npc={npc}
            isGm={isGm}
            onOpen={() => navigate(`/campaigns/${campaignId}/global-npcs/${npc.id}`)}
            onDelete={() => setConfirmDelete({ open: true, id: npc.id, name: npc.name })}
          />
        ))}
      </div>

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
