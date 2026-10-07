import { useRef, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ChevronRight, BookOpen } from 'lucide-react'
import { globalNpcsApi } from '../../api/global-npcs'
import { useCampaignStore } from '../../store/campaignStore'
import { Button, ConfirmDialog, EmptyState, ErrorMessage, Field, IconButton, Input, PageHeader, Sheet, Spinner } from '../../components/ui'
import { buttonReset, c, card, font, fs, page, radius, tint, titleText, tone } from '../../theme'
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
  const rubi = tone.rubi
  return (
    <div
      className="ui-card ui-card--interactive"
      style={{ ...card, display: 'flex', alignItems: 'center', gap: 4, paddingRight: isGm ? 8 : 0 }}
    >
      <button
        type="button"
        onClick={onOpen}
        style={{
          ...buttonReset,
          flex: 1, minWidth: 0, minHeight: 76,
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 12px 14px 16px', borderRadius: radius.lg,
        }}
      >
        {/* Avatar / image */}
        <span
          aria-hidden
          style={{
            width: 48, height: 48, borderRadius: radius.md, flexShrink: 0, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: npc.imageUrl ? c.s2 : `radial-gradient(120% 120% at 30% 20%, ${tint(rubi.fg, 20)}, var(--surface-2))`,
            border: `1px solid ${rubi.border}`,
            ...titleText, fontSize: fs.xl, color: rubi.fg,
          }}
        >
          {npc.imageUrl
            ? <img src={npc.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : npc.name[0]?.toUpperCase() ?? '?'
          }
        </span>

        {/* Info */}
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2, color: c.text }}>
            {npc.name}
          </span>
          {npc.tipo && (
            <span style={{ fontFamily: font.display, fontStyle: 'italic', fontSize: fs.md, fontWeight: 500, lineHeight: 1.3, color: c.muted }}>
              {npc.tipo}
            </span>
          )}
          {(npc.source || npc.ascendencia) && (
            <span style={{ fontSize: fs.sm, color: c.subtle, lineHeight: 1.35 }}>
              {npc.source && <span style={{ fontWeight: 600, color: c.muted }}>{npc.source}</span>}
              {npc.ascendencia && <span> · {npc.ascendencia}</span>}
            </span>
          )}
        </span>

        <ChevronRight size={18} aria-hidden style={{ color: c.subtle, flexShrink: 0 }} />
      </button>

      {/* Actions (outside the open button, so delete never opens the card) */}
      {isGm && (
        <IconButton label={`Eliminar ${npc.name}`} variant="danger" size={44} onClick={onDelete}>
          <Trash2 size={18} aria-hidden />
        </IconButton>
      )}
    </div>
  )
}

export function GlobalNpcListPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isGm } = useCampaignStore()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null; name: string }>({ open: false, id: null, name: '' })
  const inputRef = useRef<HTMLInputElement>(null)

  // The adversaries of the world of this campaign: the id is part of the key and of the request (an arrow, not `getAll` by reference: TanStack would pass it its context)
  const { data: npcs, isLoading, isError } = useQuery({
    queryKey: ['global-npcs', cId],
    queryFn: () => globalNpcsApi.getAll(cId),
  })

  const createMutation = useMutation({
    mutationFn: () => globalNpcsApi.create({ name: newName }, cId),
    onSuccess: (npc) => {
      qc.invalidateQueries({ queryKey: ['global-npcs', cId] })
      setCreating(false)
      setNewName('')
      navigate(`/campaigns/${campaignId}/global-npcs/${npc.id}`, { state: { editing: true } })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => globalNpcsApi.delete(id, cId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['global-npcs', cId] }),
  })

  const closeCreate = () => {
    setCreating(false)
    setNewName('')
    if (createMutation.isError) createMutation.reset() // only clears the error message shown in the sheet
  }

  if (isLoading) return <Spinner />

  return (
    <div style={{ ...page, paddingBottom: 48 }}>

      <PageHeader
        title="NPCs"
        subtitle={npcs?.length
          ? `${npcs.length} adversario${npcs.length !== 1 ? 's' : ''} del libro`
          : 'Sin adversarios todavía'}
        actions={isGm && (
          <Button
            icon={<Plus size={16} aria-hidden />}
            onClick={() => { setCreating(true); setTimeout(() => inputRef.current?.focus(), 50) }}
          >
            Nuevo
          </Button>
        )}
      />

      {/* Create sheet */}
      <Sheet
        open={creating}
        onClose={closeCreate}
        title="Nuevo NPC"
        description="Añade un adversario del libro de reglas."
        maxWidth={480}
        footer={
          <>
            <Button variant="secondary" size="lg" onClick={closeCreate} style={{ flex: 1 }}>Cancelar</Button>
            <Button
              size="lg"
              onClick={() => createMutation.mutate()}
              disabled={!newName.trim() || createMutation.isPending}
              style={{ flex: 2 }}
            >
              {createMutation.isPending ? 'Creando...' : 'Crear NPC'}
            </Button>
          </>
        }
      >
        <Field label="Nombre del adversario">
          <Input
            ref={inputRef}
            data-autofocus
            placeholder="Nombre del adversario..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && newName.trim() && createMutation.mutate()}
          />
        </Field>
        {createMutation.isError && (
          <ErrorMessage message="No se pudo crear el NPC. Inténtalo de nuevo." style={{ marginTop: 12 }} />
        )}
      </Sheet>

      {/* Load error (a failed fetch used to leave the page blank) */}
      {isError && !npcs && <ErrorMessage message="No se pudieron cargar los adversarios. Inténtalo de nuevo." />}

      {/* Empty state */}
      {npcs?.length === 0 && (
        <EmptyState
          icon={<BookOpen size={22} aria-hidden />}
          title="Sin adversarios todavía"
          description={isGm ? 'Importa adversarios del libro de reglas.' : 'No hay adversarios disponibles.'}
        />
      )}

      {/* List */}
      {!!npcs?.length && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {npcs.map((npc, i) => (
            <li key={npc.id} className="rise" style={{ '--i': Math.min(i, 12) } as CSSProperties}>
              <GlobalNpcCard
                npc={npc}
                isGm={isGm}
                onOpen={() => navigate(`/campaigns/${campaignId}/global-npcs/${npc.id}`)}
                onDelete={() => setConfirmDelete({ open: true, id: npc.id, name: npc.name })}
              />
            </li>
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
