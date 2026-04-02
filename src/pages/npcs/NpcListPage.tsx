import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Copy, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react'
import { npcsApi } from '../../api/npcs'
import { useCampaignStore } from '../../store/campaignStore'
import { Input, Spinner, ConfirmDialog } from '../../components/ui'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#374151,#1f2937)',
  'linear-gradient(135deg,#7f1d1d,#991b1b)',
  'linear-gradient(135deg,#1e3a5f,#1e40af)',
  'linear-gradient(135deg,#14532d,#166534)',
  'linear-gradient(135deg,#4a1d96,#5b21b6)',
  'linear-gradient(135deg,#713f12,#92400e)',
]

function NpcCard({
  npc,
  isGm,
  onOpen,
  onDelete,
  onClone,
  onToggle,
}: {
  npc: { id: number; name: string; level: number; health: number; maxHealth: number; isVisibleToPlayers: boolean }
  isGm: boolean
  onOpen: () => void
  onDelete: () => void
  onClone: () => void
  onToggle: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const gradient = npc.isVisibleToPlayers
    ? AVATAR_GRADIENTS[npc.id % AVATAR_GRADIENTS.length]
    : 'linear-gradient(135deg,#374151,#1f2937)'
  const hpPct = npc.maxHealth > 0 ? Math.min(100, Math.round((npc.health / npc.maxHealth) * 100)) : 0

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 16, cursor: 'pointer',
        background: 'var(--surface-1)',
        border: `1px solid ${hovered ? 'rgba(180,190,254,0.2)' : 'var(--border)'}`,
        transform: hovered ? 'translateX(3px)' : 'translateX(0)',
        boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.2)' : 'none',
        transition: 'transform 0.18s cubic-bezier(.22,.68,0,1.2), box-shadow 0.18s ease, border-color 0.18s ease',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 800, color: 'white',
        opacity: npc.isVisibleToPlayers ? 1 : 0.6,
        border: npc.isVisibleToPlayers ? 'none' : '1px dashed rgba(255,255,255,0.15)',
      }}>
        {npc.name[0].toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
            {npc.name}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700,
            padding: '2px 6px', borderRadius: 20,
            letterSpacing: '0.04em', textTransform: 'uppercase' as const,
            ...(npc.isVisibleToPlayers
              ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-subtle)' })
          }}>
            {npc.isVisibleToPlayers ? 'Visible' : 'Oculto'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 500, flexShrink: 0 }}>
            Nv.{npc.level}
          </span>
          <div style={{ flex: 1, height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', maxWidth: 80 }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: 'linear-gradient(90deg,#f43f5e,#fb7185)',
              width: `${hpPct}%`,
            }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 500 }}>
            {npc.health}/{npc.maxHealth}
          </span>
        </div>
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
              title={npc.isVisibleToPlayers ? 'Ocultar a jugadores' : 'Mostrar a jugadores'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '5px',
                borderRadius: 7, color: 'var(--text-subtle)',
                opacity: hovered ? 1 : 0.4,
                transition: 'opacity 0.15s, color 0.15s', display: 'flex',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#67e8f9')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
            >
              {npc.isVisibleToPlayers ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button
              onClick={onClone}
              title="Clonar NPC"
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '5px',
                borderRadius: 7, color: 'var(--text-subtle)',
                opacity: hovered ? 1 : 0.4,
                transition: 'opacity 0.15s, color 0.15s', display: 'flex',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
            >
              <Copy size={13} />
            </button>
            <button
              onClick={onDelete}
              title="Eliminar NPC"
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

export function NpcListPage() {
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

  const { data: npcs, isLoading } = useQuery({
    queryKey: ['npcs', id],
    queryFn: () => npcsApi.getAll(id),
  })

  const createMutation = useMutation({
    mutationFn: () => npcsApi.create(id, { name: newName, isVisibleToPlayers: false }),
    onSuccess: (npc) => {
      qc.invalidateQueries({ queryKey: ['npcs', id] })
      closeModal()
      navigate(`/campaigns/${id}/npcs/${npc.id}`, { state: { editing: true } })
    },
  })

  const cloneMutation = useMutation({
    mutationFn: (npcId: number) => npcsApi.clone(id, npcId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['npcs', id] }),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ npcId, visible }: { npcId: number; visible: boolean }) =>
      npcsApi.toggleVisibility(id, npcId, visible),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['npcs', id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (npcId: number) => npcsApi.delete(id, npcId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['npcs', id] }),
  })

  if (isLoading) return <Spinner />

  return (
    <div style={{ padding: '28px 20px 48px', maxWidth: 640 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 3 }}>
            NPCs
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {npcs?.length ? `${npcs.length} personaje${npcs.length !== 1 ? 's' : ''} no jugador` : 'Aún no hay NPCs'}
          </p>
        </div>

        {isGm && (
          <button
            onClick={() => setCreating(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
              color: 'white', border: 'none',
              borderRadius: 10, padding: '8px 14px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(139,92,246,0.35)', flexShrink: 0,
            }}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Nuevo NPC</span>
            <span className="sm:hidden">Nuevo</span>
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
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Nuevo NPC</h2>
            <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 20 }}>
              Después podrás completar todos los detalles.
            </p>
            <Input
              ref={inputRef}
              placeholder="Nombre del NPC..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newName.trim() && createMutation.mutate()}
              style={{ marginBottom: 14, fontSize: 15 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={closeModal}
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
                  background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                  color: 'white', border: 'none', borderRadius: 12,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  opacity: !newName.trim() || createMutation.isPending ? 0.5 : 1,
                  boxShadow: '0 2px 12px rgba(139,92,246,0.4)',
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
            <Shield size={20} style={{ color: 'var(--text-subtle)' }} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Sin NPCs todavía</h3>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: isGm ? 24 : 0 }}>
            {isGm ? 'Crea el primer NPC de la campaña.' : 'No hay NPCs visibles todavía.'}
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
              <Plus size={13} /> Crear NPC
            </button>
          )}
        </div>
      )}

      {/* NPC list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {npcs?.map((npc) => (
          <NpcCard
            key={npc.id}
            npc={npc}
            isGm={isGm}
            onOpen={() => navigate(`/campaigns/${id}/npcs/${npc.id}`)}
            onDelete={() => setConfirmDelete({ open: true, id: npc.id, name: npc.name })}
            onClone={() => cloneMutation.mutate(npc.id)}
            onToggle={() => toggleMutation.mutate({ npcId: npc.id, visible: !npc.isVisibleToPlayers })}
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
