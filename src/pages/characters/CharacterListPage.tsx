import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ArrowRight, Heart, Users, UserCheck, UserX } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { useCampaignStore } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import { Input, Spinner, ConfirmDialog } from '../../components/ui'
import type { CampaignDetail, Member } from '../../types'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import { RADIANT_ORDERS } from '../../data/radiantOrders'
import { RadiantOrderIcon } from '../../components/RadiantOrderIcon'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#7c3aed,#6366f1)',
  'linear-gradient(135deg,#0e7490,#0284c7)',
  'linear-gradient(135deg,#9d174d,#be185d)',
  'linear-gradient(135deg,#065f46,#0d9488)',
  'linear-gradient(135deg,#92400e,#b45309)',
  'linear-gradient(135deg,#4c1d95,#7c3aed)',
]

function CharacterCard({
  character,
  isGm,
  ownerName,
  onOpen,
  onDelete,
  onAssign,
  players,
}: {
  character: { id: number; name: string; level: number; ascendencia: string; caminoHeroico: string; caminoRadiante: string; health: number; maxHealth: number; ownerId?: number }
  isGm: boolean
  ownerName?: string
  onOpen: () => void
  onDelete: () => void
  onAssign: (userId: number | null) => void
  players: Member[]
}) {
  const [hovered, setHovered] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const gradient = AVATAR_GRADIENTS[character.id % AVATAR_GRADIENTS.length]
  const hpPct = character.maxHealth > 0 ? Math.round((character.health / character.maxHealth) * 100) : 0

  return (
    <>
      <div
        onClick={onOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
          background: 'var(--surface-1)',
          border: `1px solid ${hovered ? 'rgba(180,190,254,0.2)' : 'var(--border)'}`,
          transform: hovered ? 'translateX(3px)' : 'translateX(0)',
          boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.2)' : 'none',
          transition: 'transform 0.18s cubic-bezier(.22,.68,0,1.2), box-shadow 0.18s ease, border-color 0.18s ease',
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: 13, background: gradient, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 800, color: 'white',
          boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.25)' : 'none',
          transition: 'box-shadow 0.18s ease',
        }}>
          {character.name[0].toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
              {character.name}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'var(--brand-light)',
              background: 'rgba(180,190,254,0.1)', border: '1px solid rgba(180,190,254,0.15)',
              borderRadius: 6, padding: '1px 6px',
            }}>
              Nv.{character.level}
            </span>
            {/* Owner badge (GM view) */}
            {isGm && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20,
                background: ownerName ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                border: ownerName ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--border)',
                color: ownerName ? '#34d399' : 'var(--text-subtle)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {ownerName
                  ? <><UserCheck size={9} />{ownerName}</>
                  : <><UserX size={9} />Sin asignar</>}
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 4 }}>
            {character.ascendencia || 'Sin ascendencia'}
          </p>

          {/* Path badges */}
          {(character.caminoHeroico || character.caminoRadiante) && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
              {(() => {
                const path = HEROIC_PATHS.find((p) => p.id === character.caminoHeroico)
                return path ? (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
                    background: path.colorBg, border: `1px solid ${path.colorBorder}`, color: path.color,
                  }}>
                    {path.icon} {path.name}
                  </span>
                ) : null
              })()}
              {(() => {
                const order = RADIANT_ORDERS.find((o) => o.id === character.caminoRadiante)
                return order ? (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
                    background: order.colorBg, border: `1px solid ${order.colorBorder}`, color: order.color,
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                  }}>
                    <RadiantOrderIcon orderId={order.id} size={10} />
                    {order.name}
                  </span>
                ) : null
              })()}
            </div>
          )}

          {/* HP bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Heart size={9} style={{ color: '#fb7185', flexShrink: 0 }} />
              <div style={{ flex: 1, height: 3, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#f43f5e,#fb7185)', width: `${hpPct}%`, transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, minWidth: 28, textAlign: 'right' }}>
                {character.health}/{character.maxHealth}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          {isGm && (
            <>
              <button
                onClick={() => setShowAssign(true)}
                title="Asignar jugador"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
                  borderRadius: 8, color: 'var(--text-subtle)',
                  opacity: hovered ? 1 : 0.4,
                  transition: 'opacity 0.15s, color 0.15s',
                  display: 'flex', alignItems: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
              >
                <UserCheck size={13} />
              </button>
              <button
                onClick={() => onDelete()}
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
            </>
          )}
          <ArrowRight
            size={15}
            style={{
              color: hovered ? 'var(--brand-light)' : 'var(--text-subtle)',
              transform: hovered ? 'translateX(2px)' : 'translateX(0)',
              transition: 'transform 0.18s cubic-bezier(.22,.68,0,1.2), color 0.15s',
            }}
          />
        </div>
      </div>

      {/* Assign sheet */}
      {showAssign && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowAssign(false)}
          />
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 51,
            background: 'var(--surface-1)', borderTop: '1px solid var(--border-bright)',
            borderRadius: '20px 20px 0 0', padding: '8px 20px 32px',
            boxShadow: '0 -16px 48px rgba(0,0,0,0.4)',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 4, background: 'var(--surface-3)', margin: '8px auto 20px' }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
              Asignar jugador
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 16 }}>
              Elige quién controla a <strong style={{ color: 'var(--text)' }}>{character.name}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Unassign option */}
              <button
                onClick={() => { onAssign(null); setShowAssign(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                  background: !character.ownerId ? 'rgba(180,190,254,0.08)' : 'var(--surface-2)',
                  border: `1px solid ${!character.ownerId ? 'rgba(180,190,254,0.2)' : 'var(--border)'}`,
                  color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, textAlign: 'left',
                }}
              >
                <UserX size={16} style={{ color: 'var(--text-subtle)' }} />
                Sin asignar
              </button>
              {players.map((p) => (
                <button
                  key={p.userId}
                  onClick={() => { onAssign(p.userId); setShowAssign(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                    background: character.ownerId === p.userId ? 'rgba(16,185,129,0.08)' : 'var(--surface-2)',
                    border: `1px solid ${character.ownerId === p.userId ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                    color: 'var(--text)', fontSize: 13, fontWeight: 500, textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg,#7c3aed,#6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'white',
                  }}>
                    {p.displayName[0].toUpperCase()}
                  </div>
                  {p.displayName}
                  {character.ownerId === p.userId && (
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#34d399' }}>actual</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export function CharacterListPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const id = Number(campaignId)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isGm, currentCampaign } = useCampaignStore()
  const { user } = useAuthStore()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newOwnerId, setNewOwnerId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null; name: string }>({ open: false, id: null, name: '' })
  const inputRef = useRef<HTMLInputElement>(null)

  const players = (currentCampaign as CampaignDetail | null)?.members?.filter((m) => m.role === 'player') ?? []

  const { data: characters, isLoading } = useQuery({
    queryKey: ['characters', id],
    queryFn: () => charactersApi.getAll(id),
  })

  // Players: auto-navigate to their character if it exists
  useEffect(() => {
    if (!isGm && characters && characters.length === 1) {
      navigate(`/campaigns/${id}/characters/${characters[0].id}`, { replace: true })
    }
  }, [isGm, characters, id, navigate])

  const createMutation = useMutation({
    mutationFn: () => charactersApi.create(id, {
      name: newName, playerName: '', level: 1,
      ascendencia: '', caminoHeroico: '', caminoRadiante: '',
      ownerId: newOwnerId ?? undefined,
    }),
    onSuccess: (char) => {
      qc.invalidateQueries({ queryKey: ['characters', id] })
      setCreating(false); setNewName(''); setNewOwnerId(null)
      navigate(`/campaigns/${id}/characters/${char.id}`, { state: { editing: true } })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (charId: number) => charactersApi.delete(id, charId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['characters', id] }),
  })

  const assignMutation = useMutation({
    mutationFn: ({ charId, ownerId }: { charId: number; ownerId: number | null }) =>
      charactersApi.assign(id, charId, ownerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['characters', id] }),
  })

  useEffect(() => { if (creating) setTimeout(() => inputRef.current?.focus(), 50) }, [creating])

  const closeModal = () => { setCreating(false); setNewName(''); setNewOwnerId(null) }

  if (isLoading) return <Spinner />

  // Player with no character
  if (!isGm && (!characters || characters.length === 0)) {
    return (
      <div style={{ padding: '20px 16px 48px', maxWidth: 680, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 32 }}>
          Mi personaje
        </h1>
        <div style={{
          border: '1.5px dashed var(--border-bright)', borderRadius: 20,
          padding: '52px 32px', textAlign: 'center', background: 'var(--surface-1)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 16px',
            background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={20} style={{ color: 'var(--text-subtle)' }} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Sin personaje asignado
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>
            El GM aún no te ha asignado un personaje.
          </p>
        </div>
      </div>
    )
  }

  const getOwnerName = (ownerId?: number) => {
    if (!ownerId) return undefined
    return (currentCampaign as CampaignDetail | null)?.members?.find((m) => m.userId === ownerId)?.displayName
  }

  return (
    <div style={{ padding: '20px 16px 48px', maxWidth: 680, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>
            {isGm ? 'Personajes' : 'Mi personaje'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {isGm
              ? `${characters?.length ?? 0} personaje${(characters?.length ?? 0) !== 1 ? 's' : ''}`
              : characters?.find((c) => c.ownerId === user?.id)?.name ?? ''}
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
            <span className="hidden sm:inline">Nuevo personaje</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        )}
      </div>

      {/* Create bottom-sheet */}
      {creating && (
        <>
          <div
            onClick={closeModal}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          />
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 51,
            background: 'var(--surface-1)', borderTop: '1px solid var(--border-bright)',
            borderRadius: '20px 20px 0 0', padding: '8px 20px 32px',
            boxShadow: '0 -16px 48px rgba(0,0,0,0.4)',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 4, background: 'var(--surface-3)', margin: '8px auto 20px' }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Nuevo personaje</h2>
            <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 20 }}>Después podrás completar todos los detalles.</p>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 6 }}>
                Nombre del personaje
              </label>
              <Input
                ref={inputRef}
                placeholder="Nombre del personaje..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && newName.trim() && createMutation.mutate()}
                style={{ fontSize: 15 }}
              />
            </div>

            {players.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 6 }}>
                  Asignar a jugador (opcional)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button
                    onClick={() => { setNewOwnerId(null); setNewName('') }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                      borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                      background: newOwnerId === null ? 'rgba(180,190,254,0.08)' : 'var(--surface-2)',
                      border: `1px solid ${newOwnerId === null ? 'rgba(180,190,254,0.2)' : 'var(--border)'}`,
                      color: 'var(--text-subtle)', fontSize: 13,
                    }}
                  >
                    <UserX size={14} /> Sin asignar
                  </button>
                  {players.map((p) => (
                    <button
                      key={p.userId}
                      onClick={() => { setNewOwnerId(p.userId); setNewName(p.displayName) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                        borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                        background: newOwnerId === p.userId ? 'rgba(16,185,129,0.08)' : 'var(--surface-2)',
                        border: `1px solid ${newOwnerId === p.userId ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                        color: newOwnerId === p.userId ? '#34d399' : 'var(--text)', fontSize: 13, fontWeight: 500,
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg,#7c3aed,#6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: 'white',
                      }}>
                        {p.displayName[0].toUpperCase()}
                      </div>
                      {p.displayName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={closeModal} style={{ flex: 1, padding: '11px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border-bright)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!newName.trim() || createMutation.isPending}
                style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: !newName.trim() || createMutation.isPending ? 0.5 : 1, boxShadow: '0 2px 12px rgba(139,92,246,0.4)' }}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear personaje'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty state (GM) */}
      {characters?.length === 0 && isGm && (
        <div style={{ border: '1.5px dashed var(--border-bright)', borderRadius: 20, padding: '52px 32px', textAlign: 'center', background: 'var(--surface-1)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, margin: '0 auto 16px', background: 'var(--surface-2)', border: '1px solid var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} style={{ color: 'var(--text-subtle)' }} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Sin personajes todavía</h3>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 24 }}>Crea un personaje y asígnalo a cada jugador.</p>
          <button
            onClick={() => setCreating(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: 'white', border: 'none', borderRadius: 10, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 10px rgba(139,92,246,0.3)' }}
          >
            <Plus size={13} /> Crear personaje
          </button>
        </div>
      )}

      {/* Character list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {characters?.map((c) => (
          <CharacterCard
            key={c.id}
            character={c}
            isGm={isGm}
            ownerName={getOwnerName(c.ownerId)}
            onOpen={() => navigate(`/campaigns/${id}/characters/${c.id}`)}
            onDelete={() => setConfirmDelete({ open: true, id: c.id, name: c.name })}
            onAssign={(ownerId) => assignMutation.mutate({ charId: c.id, ownerId })}
            players={players}
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
