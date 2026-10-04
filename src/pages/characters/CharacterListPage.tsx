import { useState, useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ChevronRight, Users, UserCheck, UserX, UserCog, Check } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { useCampaignStore } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import { Avatar, Button, ConfirmDialog, EmptyState, Field, IconButton, Input, PageHeader, Sheet, Spinner } from '../../components/ui'
import type { CampaignDetail, Member } from '../../types'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import { RADIANT_ORDERS } from '../../data/radiantOrders'
import { RadiantOrderIcon } from '../../components/RadiantOrderIcon'
import { HeroicPathIcon } from '../../components/GameIcons'
import { characterGradient } from '../../lib/avatar'
import { buttonReset, c, card, eyebrow, fs, page, pill, radius, shadow, titleText, tone, toneFrom, type Tone } from '../../theme'
import { onGem } from '../../lib/hero'

/* White initial on the deep character gradient (lib/avatar: ≥ 10:1 on every palette). */
const ON_GEM = onGem

// ─── Option row used by the player pickers (create + assign sheets) ────────

function PickerOption({
  selected,
  selectedTone,
  onClick,
  leading,
  children,
  trailing,
  autoFocus = false,
}: {
  selected: boolean
  selectedTone: Tone
  onClick: () => void
  leading: ReactNode
  children: ReactNode
  trailing?: ReactNode
  /** Receive focus when the enclosing Sheet opens (useDialogA11y looks for data-autofocus) */
  autoFocus?: boolean
}) {
  return (
    <button
      type="button"
      data-autofocus={autoFocus || undefined}
      aria-pressed={selected}
      onClick={onClick}
      className={selected ? undefined : 'ui-row'}
      style={{
        ...buttonReset,
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        minHeight: 52, padding: '8px 14px',
        borderRadius: radius.md,
        background: selected ? selectedTone.bg : c.s2,
        border: `1px solid ${selected ? selectedTone.border : c.border}`,
        color: c.text, fontSize: fs.base, fontWeight: selected ? 650 : 550,
      }}
    >
      <span aria-hidden style={{ display: 'inline-flex', color: selected ? selectedTone.fg : c.muted }}>{leading}</span>
      <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{children}</span>
      {trailing}
      {selected && <Check size={18} aria-hidden style={{ color: selectedTone.fg }} />}
    </button>
  )
}

// ─── Character card (list row) ─────────────────────────────────────────────

function CharacterCard({
  character,
  isGm,
  ownerName,
  onOpen,
  onDelete,
  onAssign,
  players,
  index = 0,
}: {
  character: { id: number; name: string; level: number; ascendencia: string; caminoHeroico: string; caminoRadiante: string; maxHealth: number; ownerId?: number }
  isGm: boolean
  ownerName?: string
  onOpen: () => void
  onDelete: () => void
  onAssign: (userId: number | null) => void
  players: Member[]
  index?: number
}) {
  const [showAssign, setShowAssign] = useState(false)
  const path = HEROIC_PATHS.find((p) => p.id === character.caminoHeroico)
  const order = RADIANT_ORDERS.find((o) => o.id === character.caminoRadiante)
  const hasPaths = !!(character.caminoHeroico || character.caminoRadiante) && !!(path || order)
  const r = radius.lg - 1

  return (
    <>
      <li className="rise" style={{ '--i': Math.min(index, 10), ...card, display: 'flex' } as CSSProperties}>
        <button
          type="button"
          onClick={onOpen}
          className="ui-row"
          style={{
            ...buttonReset,
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 12px 14px 16px',
            minHeight: 76,
            borderRadius: isGm ? `${r}px 0 0 ${r}px` : r,
            outlineOffset: -2,
          }}
        >
          {/* Avatar */}
          <span
            aria-hidden
            style={{
              width: 48, height: 48, flexShrink: 0, borderRadius: radius.md,
              background: characterGradient(character.id), boxShadow: shadow[1],
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              ...titleText, fontSize: fs.xl, lineHeight: 1, color: ON_GEM,
            }}
          >
            {character.name.charAt(0).toUpperCase() || '?'}
          </span>

          {/* Info */}
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ ...titleText, fontSize: fs.md + 1, color: c.text, overflowWrap: 'anywhere' }}>
              {character.name}
            </span>

            {/* Path badges */}
            {hasPaths && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {path && (
                  <span style={pill(toneFrom(path.color))}>
                    <HeroicPathIcon id={path.id} size={13} />
                    {path.name}
                  </span>
                )}
                {order && (
                  <span style={{ ...pill(toneFrom(order.color)), paddingLeft: 4 }}>
                    <RadiantOrderIcon orderId={order.id} size={16} decorative />
                    {order.name}
                  </span>
                )}
              </span>
            )}

            {/* Meta line: level · ascendencia, then the owner badge (GM view) */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.4, fontVariantNumeric: 'tabular-nums' }}>
                Nv. {character.level}
                <span aria-hidden style={{ margin: '0 6px', color: c.subtle }}>·</span>
                {character.ascendencia || 'Sin ascendencia'}
              </span>
              {isGm && (
                <span style={pill(ownerName ? tone.esmeralda : tone.cuarzo)}>
                  {ownerName
                    ? <><UserCheck size={13} aria-hidden />{ownerName}</>
                    : <><UserX size={13} aria-hidden />Sin asignar</>}
                </span>
              )}
            </span>
          </span>

          <ChevronRight size={18} aria-hidden style={{ color: c.subtle }} />
        </button>

        {/* Actions (siblings of the open button, never nested) */}
        {isGm && (
          <div
            style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4,
              padding: '6px', borderLeft: `1px solid ${c.border}`,
            }}
          >
            <IconButton label="Asignar jugador" size={44} aria-haspopup="dialog" onClick={() => setShowAssign(true)}>
              <UserCog size={18} aria-hidden />
            </IconButton>
            <IconButton label={`Eliminar ${character.name}`} size={44} variant="danger" onClick={() => onDelete()}>
              <Trash2 size={18} aria-hidden />
            </IconButton>
          </div>
        )}
      </li>

      {/* Assign sheet */}
      <Sheet
        open={showAssign}
        onClose={() => setShowAssign(false)}
        title="Asignar jugador"
        maxWidth={460}
        description={<>Elige quién controla a <strong style={{ color: c.text, fontWeight: 650 }}>{character.name}</strong></>}
        footer={
          <Button variant="secondary" size="lg" fullWidth onClick={() => setShowAssign(false)}>
            Cancelar
          </Button>
        }
      >
        <div role="group" aria-label="Jugadores" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Unassign option */}
          <PickerOption
            selected={!character.ownerId}
            autoFocus={!character.ownerId}
            selectedTone={tone.brand}
            onClick={() => { onAssign(null); setShowAssign(false) }}
            leading={<UserX size={20} />}
          >
            Sin asignar
          </PickerOption>
          {players.map((p) => (
            <PickerOption
              key={p.userId}
              selected={character.ownerId === p.userId}
              autoFocus={character.ownerId === p.userId}
              selectedTone={tone.esmeralda}
              onClick={() => { onAssign(p.userId); setShowAssign(false) }}
              leading={<Avatar name={p.displayName} size={30} tone={character.ownerId === p.userId ? 'esmeralda' : 'brand'} />}
              trailing={character.ownerId === p.userId && (
                <span style={{ fontSize: fs.xs, fontWeight: 650, color: tone.esmeralda.fg }}>actual</span>
              )}
            >
              {p.displayName}
            </PickerOption>
          ))}
        </div>
      </Sheet>
    </>
  )
}

export function CharacterListPage({ makeDetailPath }: { makeDetailPath?: (charId: number) => string } = {}) {
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

  const createMutation = useMutation({
    mutationFn: () => charactersApi.create(id, {
      name: newName, playerName: '', level: 1,
      ascendencia: '', caminoHeroico: '', caminoRadiante: '', caminoMetal: '', caminoInicial: '',
      ownerId: newOwnerId ?? undefined,
    }),
    onSuccess: (char) => {
      qc.invalidateQueries({ queryKey: ['characters', id] })
      setCreating(false); setNewName(''); setNewOwnerId(null)
      navigate(makeDetailPath ? makeDetailPath(char.id) : `/campaigns/${id}/characters/${char.id}`, { state: { editing: true } })
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
      <div style={{ ...page, paddingBottom: 48 }}>
        <PageHeader title="Mi personaje" />
        <EmptyState
          icon={<Users size={22} aria-hidden />}
          title="Sin personaje asignado"
          description="El GM aún no te ha asignado un personaje."
        />
      </div>
    )
  }

  const getOwnerName = (ownerId?: number) => {
    if (!ownerId) return undefined
    return (currentCampaign as CampaignDetail | null)?.members?.find((m) => m.userId === ownerId)?.displayName
  }

  return (
    <div style={{ ...page, paddingBottom: 48 }}>

      {/* Header */}
      <PageHeader
        title={isGm ? 'Personajes' : 'Mi personaje'}
        subtitle={isGm
          ? `${characters?.length ?? 0} personaje${(characters?.length ?? 0) !== 1 ? 's' : ''}`
          : characters?.find((c) => c.ownerId === user?.id)?.name ?? ''}
        actions={isGm && (
          <Button icon={<Plus size={16} aria-hidden />} onClick={() => setCreating(true)} aria-haspopup="dialog">
            <span className="hide-mobile">Nuevo personaje</span>
            <span className="only-mobile">Nuevo</span>
          </Button>
        )}
      />

      {/* Create sheet */}
      <Sheet
        open={creating}
        onClose={closeModal}
        title="Nuevo personaje"
        description="Después podrás completar todos los detalles."
        footer={
          <>
            <Button variant="secondary" size="lg" onClick={closeModal} style={{ flex: 1 }}>
              Cancelar
            </Button>
            <Button
              size="lg"
              onClick={() => createMutation.mutate()}
              disabled={!newName.trim() || createMutation.isPending}
              aria-busy={createMutation.isPending || undefined}
              style={{ flex: 2 }}
            >
              {createMutation.isPending ? 'Creando...' : 'Crear personaje'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Field label="Nombre del personaje">
            <Input
              ref={inputRef}
              placeholder="Nombre del personaje..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newName.trim() && createMutation.mutate()}
            />
          </Field>

          {players.length > 0 && (
            <fieldset style={{ border: 'none', minWidth: 0 }}>
              <legend style={{ ...eyebrow, padding: 0, marginBottom: 8 }}>
                Asignar a jugador (opcional)
              </legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <PickerOption
                  selected={newOwnerId === null}
                  selectedTone={tone.brand}
                  onClick={() => { setNewOwnerId(null); setNewName('') }}
                  leading={<UserX size={20} />}
                >
                  Sin asignar
                </PickerOption>
                {players.map((p) => (
                  <PickerOption
                    key={p.userId}
                    selected={newOwnerId === p.userId}
                    selectedTone={tone.esmeralda}
                    onClick={() => { setNewOwnerId(p.userId); setNewName(p.displayName) }}
                    leading={<Avatar name={p.displayName} size={30} tone={newOwnerId === p.userId ? 'esmeralda' : 'brand'} />}
                  >
                    {p.displayName}
                  </PickerOption>
                ))}
              </div>
            </fieldset>
          )}
        </div>
      </Sheet>

      {/* Empty state (GM) */}
      {characters?.length === 0 && isGm && (
        <EmptyState
          icon={<Users size={22} aria-hidden />}
          title="Sin personajes todavía"
          description="Crea un personaje y asígnalo a cada jugador."
          action={
            <Button icon={<Plus size={16} aria-hidden />} onClick={() => setCreating(true)} aria-haspopup="dialog">
              Crear personaje
            </Button>
          }
        />
      )}

      {/* Character list */}
      {!!characters?.length && (
        <ul role="list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {characters.map((c, i) => (
            <CharacterCard
              key={c.id}
              index={i}
              character={c}
              isGm={isGm}
              ownerName={getOwnerName(c.ownerId)}
              onOpen={() => navigate(makeDetailPath ? makeDetailPath(c.id) : `/campaigns/${id}/characters/${c.id}`)}
              onDelete={() => setConfirmDelete({ open: true, id: c.id, name: c.name })}
              onAssign={(ownerId) => assignMutation.mutate({ charId: c.id, ownerId })}
              players={players}
            />
          ))}
        </ul>
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
