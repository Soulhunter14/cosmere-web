import { useState, useMemo, useId, type CSSProperties, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X, Edit2, Trash2, Share2, BookUser, ChevronRight, Clock } from 'lucide-react'
import { npcNotesApi } from '../../api/npcNotes'
import { globalNpcsApi } from '../../api/global-npcs'
import { useCampaignStore } from '../../store/campaignStore'
import { Button, ConfirmDialog, EmptyState, ErrorMessage, Field, IconButton, Input, PageHeader, SectionTitle, Sheet, Spinner, Switch, Textarea } from '../../components/ui'
import { c, card, eyebrow, font, fs, page, pill, radius, tint, titleText, tone, type Tone, type ToneName } from '../../theme'
import type { NpcNote } from '../../types'

/* Per-NPC identity colour, chosen by a name hash. The ten slots are the gem tones that replace the old
   hard-coded palette (red, orange, amber, green, emerald, blue, violet, pink, slate, teal), in the same order,
   so every NPC keeps its colour family and the tones stay AA in both themes. */
const AVATAR_TONES: ToneName[] = [
  'rubi', 'heliodoro', 'topacio', 'esmeralda', 'esmeralda',
  'zafiro', 'amatista', 'granate', 'cuarzo', 'circon',
]

function avatarTone(name: string): Tone {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return tone[AVATAR_TONES[h % AVATAR_TONES.length]]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

const shared = tone.zafiro

// ─── Local pieces ──────────────────────────────────────────────────────────────

/** Initial-letter tile in the NPC's identity colour (decorative: the name is always next to it) */
function NpcInitial({ name, size }: { name: string; size: number }) {
  const t = avatarTone(name)
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, borderRadius: size >= 44 ? radius.md : radius.sm, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(120% 120% at 30% 20%, ${tint(t.fg, 22)}, ${tint(t.fg, 8)})`,
        border: `1px solid ${tint(t.fg, 40)}`,
        ...titleText, fontSize: Math.round(size * 0.46), color: t.fg,
      }}
    >
      {name[0]?.toUpperCase() ?? '?'}
    </span>
  )
}

/** Close button pinned to the sheet's top-right corner (it does not scroll with the content) */
function SheetClose({ onClose }: { onClose: () => void }) {
  return (
    <IconButton label="Cerrar" size={44} onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
      <X size={20} aria-hidden />
    </IconButton>
  )
}

/** "Compartir con jugadores" row: the whole row is the label of a real switch */
function ShareSwitch({ checked, onToggle, description }: { checked: boolean; onToggle: () => void; description: ReactNode }) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', minHeight: 56,
        borderRadius: radius.md, cursor: 'pointer',
        border: `1px solid ${checked ? shared.border : c.border}`,
        background: checked ? shared.bg : c.s2,
        transition: 'background var(--dur-2), border-color var(--dur-2)',
      }}
    >
      <Share2 size={18} aria-hidden style={{ color: checked ? shared.fg : c.subtle, flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: fs.sm + 1, fontWeight: 650, color: checked ? shared.fg : c.text }}>
          Compartir con jugadores
        </span>
        <span style={{ display: 'block', fontSize: fs.xs, color: c.muted, marginTop: 2, lineHeight: 1.4 }}>
          {description}
        </span>
      </span>
      <Switch id={id} checked={checked} onChange={onToggle} label="Compartir con jugadores" />
    </label>
  )
}

function NoteDate({ iso }: { iso: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
      <Clock size={12} aria-hidden style={{ color: c.subtle }} />
      <time dateTime={iso} style={{ fontSize: fs.xs, color: c.subtle }}>{formatDate(iso)}</time>
    </div>
  )
}

const noteCard: CSSProperties = {
  background: c.s2, borderRadius: radius.md, padding: '12px 14px',
  border: `1px solid ${c.border}`,
}
const noteText: CSSProperties = { fontSize: fs.base, color: c.text, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }
const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }

// ─── NPC Detail Sheet ────────────────────────────────────────────────────────

function NpcDetailSheet({
  npcName, notes, isGm, onClose,
  onAdd, onEdit, onDelete, onToggleShared,
  addingSaving, editingSaving,
}: {
  npcName: string
  notes: NpcNote[]
  isGm: boolean
  onClose: () => void
  onAdd: (text: string) => void
  onEdit: (note: NpcNote, text: string) => void
  onDelete: (id: number) => void
  onToggleShared: () => void
  addingSaving: boolean
  editingSaving: boolean
}) {
  const [addText, setAddText] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  const ownNotes = notes.filter((n) => n.isOwn)
  const othersNotes = notes.filter((n) => !n.isOwn)
  const isShared = ownNotes[0]?.isShared ?? false

  return (
    <Sheet
      open
      onClose={onClose}
      maxWidth={560}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 44, minWidth: 0 }}>
          <NpcInitial name={npcName} size={40} />
          {/* The name is the key information: it wraps instead of being cut */}
          <span style={{ ...titleText, fontSize: fs.xl, color: c.text, minWidth: 0, overflowWrap: 'anywhere' }}>
            {npcName}
          </span>
        </span>
      }
    >
      <SheetClose onClose={onClose} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Shared toggle — only if player has own notes */}
        {ownNotes.length > 0 && (
          <ShareSwitch
            checked={isShared}
            onToggle={onToggleShared}
            description={isShared ? 'Todos pueden ver las notas de este NPC' : 'Solo tú puedes ver estas notas'}
          />
        )}

        {/* Own notes */}
        {ownNotes.length > 0 && (
          <ul style={listReset}>
            {ownNotes.map((note) => (
              <li key={note.id} style={noteCard}>
                {editingId === note.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Textarea
                      aria-label="Editar nota"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={4}
                      autoFocus
                      style={{ lineHeight: 1.6, background: c.s1 }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button
                        onClick={() => { onEdit(note, editText); setEditingId(null) }}
                        disabled={!editText.trim() || editingSaving}
                        style={{ flex: 1 }}
                      >
                        {editingSaving ? 'Guardando...' : 'Guardar'}
                      </Button>
                      <Button variant="secondary" onClick={() => setEditingId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <p style={{ ...noteText, flex: 1, paddingTop: 4 }}>
                        {note.notes || <em style={{ color: c.subtle }}>Sin texto</em>}
                      </p>
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0, margin: '-4px -6px 0 0' }}>
                        <IconButton label="Editar nota" onClick={() => { setEditingId(note.id); setEditText(note.notes) }}>
                          <Edit2 size={16} aria-hidden />
                        </IconButton>
                        <IconButton label="Eliminar nota" variant="danger" onClick={() => onDelete(note.id)}>
                          <Trash2 size={16} aria-hidden />
                        </IconButton>
                      </div>
                    </div>
                    <NoteDate iso={note.updatedAt} />
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Others' notes */}
        {othersNotes.length > 0 && (
          <section aria-labelledby="npc-others-notes" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <h3 id="npc-others-notes" style={{ ...eyebrow, fontFamily: font.ui, color: 'var(--gold)' }}>
              DE OTROS JUGADORES
            </h3>
            <ul style={listReset}>
              {othersNotes.map((note) => (
                <li key={note.id} style={{ ...noteCard, border: `1px solid ${shared.border}`, boxShadow: `inset 3px 0 0 ${shared.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, minHeight: isGm ? 40 : undefined }}>
                    <span style={{ fontSize: fs.xs, fontWeight: 700, color: shared.fg, flex: 1, minWidth: 0 }}>
                      por {note.authorName}
                    </span>
                    {isGm && (
                      <IconButton label={`Eliminar nota de ${note.authorName}`} variant="danger" onClick={() => onDelete(note.id)} style={{ margin: '-4px -6px -4px 0' }}>
                        <Trash2 size={16} aria-hidden />
                      </IconButton>
                    )}
                  </div>
                  <p style={noteText}>{note.notes}</p>
                  <NoteDate iso={note.updatedAt} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Add note inline */}
        {addOpen ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
            <Textarea
              aria-label="Nueva nota"
              value={addText}
              onChange={(e) => setAddText(e.target.value)}
              placeholder="Escribe la nota..."
              rows={4}
              autoFocus
              style={{ lineHeight: 1.6 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                onClick={() => { onAdd(addText); setAddText(''); setAddOpen(false) }}
                disabled={!addText.trim() || addingSaving}
                style={{ flex: 1 }}
              >
                {addingSaving ? 'Guardando...' : 'Guardar nota'}
              </Button>
              <Button variant="secondary" onClick={() => { setAddOpen(false); setAddText('') }}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            icon={<Plus size={16} aria-hidden />}
            onClick={() => setAddOpen(true)}
            fullWidth
            style={{ justifyContent: 'flex-start', border: '1.5px dashed var(--border-strong)', color: c.muted }}
          >
            Añadir nota
          </Button>
        )}
      </div>
    </Sheet>
  )
}

// ─── Create NPC Sheet ─────────────────────────────────────────────────────────

function CreateNpcSheet({
  npcNames, onSave, onClose, saving,
}: {
  npcNames: string[]
  onSave: (data: { npcName: string; notes: string; isShared: boolean }) => void
  onClose: () => void
  saving: boolean
}) {
  const [form, setForm] = useState({ npcName: '', notes: '', isShared: false })

  return (
    <Sheet
      open
      onClose={onClose}
      maxWidth={520}
      title={<span style={{ display: 'block', paddingRight: 44 }}>Nueva nota de NPC</span>}
      footer={
        <Button
          size="lg"
          fullWidth
          onClick={() => onSave(form)}
          disabled={!form.npcName.trim() || saving}
        >
          {saving ? 'Guardando...' : 'Crear nota'}
        </Button>
      }
    >
      <SheetClose onClose={onClose} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
        {/* NPC Name with autocomplete */}
        <div>
          <Field label="NOMBRE DEL NPC">
            <Input
              list="npc-names-list"
              placeholder="Nombre del NPC..."
              value={form.npcName}
              onChange={(e) => setForm((p) => ({ ...p, npcName: e.target.value }))}
              data-autofocus
              style={{ fontWeight: 600 }}
            />
          </Field>
          <datalist id="npc-names-list">
            {npcNames.map((name) => <option key={name} value={name} />)}
          </datalist>
        </div>

        {/* Notes */}
        <Field label="NOTA">
          <Textarea
            placeholder="Escribe tu primera nota sobre este NPC..."
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            rows={5}
            style={{ lineHeight: 1.6 }}
          />
        </Field>

        {/* Shared toggle */}
        <ShareSwitch
          checked={form.isShared}
          onToggle={() => setForm((p) => ({ ...p, isShared: !p.isShared }))}
          description={form.isShared ? 'Todos los jugadores pueden ver las notas de este NPC' : 'Solo tú puedes ver estas notas'}
        />
      </div>
    </Sheet>
  )
}

// ─── NPC Group Card ───────────────────────────────────────────────────────────

function NpcGroupCard({ npcName, notes, onClick }: { npcName: string; notes: NpcNote[]; onClick: () => void }) {
  const accent = avatarTone(npcName).fg
  const ownNotes = notes.filter((n) => n.isOwn)
  const othersNotes = notes.filter((n) => !n.isOwn)
  const isShared = ownNotes.some((n) => n.isShared)

  return (
    <button
      type="button"
      onClick={onClick}
      className="ui-card ui-card--interactive"
      style={{
        ...card,
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: `inset 3px 0 0 ${accent}, var(--shadow-1)`,
        padding: '14px 14px 14px 18px', minHeight: 76,
        cursor: 'pointer', textAlign: 'left', width: '100%', color: 'inherit', font: 'inherit',
      }}
    >
      <NpcInitial name={npcName} size={44} />

      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2, color: c.text }}>{npcName}</span>
          {isShared && (
            <span style={{ ...pill(shared), padding: '1px 8px', fontSize: fs.eyebrow, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <Share2 size={11} aria-hidden />
              COMPARTIDA
            </span>
          )}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: fs.xs, fontWeight: 600, color: c.muted,
            background: c.s2, border: `1px solid ${c.border}`, borderRadius: radius.full, padding: '1px 9px',
          }}>
            {notes.length} nota{notes.length !== 1 ? 's' : ''}
          </span>
          {othersNotes.length > 0 && ownNotes.length === 0 && (
            <span style={{ fontSize: fs.xs, color: c.muted }}>
              · de {[...new Set(othersNotes.map((n) => n.authorName))].join(', ')}
            </span>
          )}
        </span>
      </span>

      <ChevronRight size={18} aria-hidden style={{ color: c.subtle, flexShrink: 0 }} />
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function NpcNotesPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const qc = useQueryClient()
  const { isGm } = useCampaignStore()

  const [selectedNpc, setSelectedNpc] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const { data: notes = [], isLoading, isError } = useQuery({
    queryKey: ['npc-notes', cId],
    queryFn: () => npcNotesApi.getAll(cId),
  })

  const { data: globalNpcs = [] } = useQuery({
    queryKey: ['global-npcs', cId],
    queryFn: () => globalNpcsApi.getAll(cId),
  })

  const createMutation = useMutation({
    mutationFn: (data: { npcName: string; notes: string; isShared: boolean }) =>
      npcNotesApi.create(cId, data),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['npc-notes', cId] })
      setCreating(false)
      setSelectedNpc(created.npcName)
    },
  })

  const addNoteMutation = useMutation({
    mutationFn: (data: { npcName: string; notes: string; isShared: boolean }) =>
      npcNotesApi.create(cId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['npc-notes', cId] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { npcName: string; notes: string; isShared: boolean } }) =>
      npcNotesApi.update(cId, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['npc-notes', cId] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => npcNotesApi.delete(cId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['npc-notes', cId] })
      // Close detail sheet if the NPC has no more notes after deletion
      if (selectedNpc) {
        const remaining = notes.filter((n) => n.npcName === selectedNpc && n.id !== confirmDelete.id)
        if (remaining.length === 0) setSelectedNpc(null)
      }
    },
  })

  // Group notes by npcName
  const grouped = useMemo(() => {
    const map = new Map<string, NpcNote[]>()
    for (const note of notes) {
      const arr = map.get(note.npcName) ?? []
      arr.push(note)
      map.set(note.npcName, arr)
    }
    return map
  }, [notes])

  const ownGroups: string[] = []
  const othersGroups: string[] = []
  grouped.forEach((groupNotes, name) => {
    if (groupNotes.some((n) => n.isOwn)) ownGroups.push(name)
    else othersGroups.push(name)
  })

  const npcNames = globalNpcs.map((n) => n.name)
  const selectedNotes = selectedNpc ? (grouped.get(selectedNpc) ?? []) : []

  const handleToggleShared = (npcName: string) => {
    const groupNotes = grouped.get(npcName) ?? []
    const ownNotes = groupNotes.filter((n) => n.isOwn)
    const newShared = !(ownNotes[0]?.isShared ?? false)
    Promise.all(
      ownNotes.map((n) =>
        npcNotesApi.update(cId, n.id, { npcName: n.npcName, notes: n.notes, isShared: newShared })
      )
    ).then(() => qc.invalidateQueries({ queryKey: ['npc-notes', cId] }))
  }

  const handleAddNote = (npcName: string, text: string) => {
    const groupNotes = grouped.get(npcName) ?? []
    const ownNotes = groupNotes.filter((n) => n.isOwn)
    const isShared = ownNotes[0]?.isShared ?? false
    addNoteMutation.mutate({ npcName, notes: text, isShared })
  }

  const handleEditNote = (note: NpcNote, text: string) => {
    updateMutation.mutate({ id: note.id, data: { npcName: note.npcName, notes: text, isShared: note.isShared } })
  }

  const handleDelete = (id: number) => {
    setConfirmDelete({ open: true, id })
  }

  if (isLoading) return <Spinner />

  return (
    <div style={{ ...page, paddingBottom: 80 }}>
      <PageHeader
        title="Notas de NPCs"
        subtitle={ownGroups.length
          ? `${ownGroups.length} NPC${ownGroups.length !== 1 ? 's' : ''} anotado${ownGroups.length !== 1 ? 's' : ''}`
          : 'Sin notas todavía'}
        actions={
          <Button icon={<Plus size={16} aria-hidden />} onClick={() => setCreating(true)}>
            Nueva nota
          </Button>
        }
      />

      {/* Load error (otherwise a failed fetch looks like an empty list) */}
      {isError && (
        <ErrorMessage message="No se pudieron cargar las notas. Inténtalo de nuevo." style={{ marginBottom: 16 }} />
      )}

      {/* Empty state */}
      {notes.length === 0 && (
        <EmptyState
          icon={<BookUser size={22} aria-hidden />}
          title="Sin notas todavía"
          description="Registra lo que sabes sobre los NPCs que encuentres en tu aventura."
          action={
            <Button icon={<Plus size={16} aria-hidden />} onClick={() => setCreating(true)}>
              Nueva nota
            </Button>
          }
        />
      )}

      {/* Own NPC groups */}
      {ownGroups.length > 0 && (
        <ul style={{ ...listReset, marginBottom: othersGroups.length > 0 ? 32 : 0 }}>
          {ownGroups.map((name, i) => (
            <li key={name} className="rise" style={{ '--i': Math.min(i, 12) } as CSSProperties}>
              <NpcGroupCard
                npcName={name}
                notes={grouped.get(name) ?? []}
                onClick={() => setSelectedNpc(name)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Others' NPC groups */}
      {othersGroups.length > 0 && (
        <section aria-labelledby="npc-others-groups">
          <SectionTitle id="npc-others-groups">COMPARTIDAS POR OTROS JUGADORES</SectionTitle>
          <ul style={listReset}>
            {othersGroups.map((name, i) => (
              <li key={name} className="rise" style={{ '--i': Math.min(ownGroups.length + i, 12) } as CSSProperties}>
                <NpcGroupCard
                  npcName={name}
                  notes={grouped.get(name) ?? []}
                  onClick={() => setSelectedNpc(name)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* NPC detail sheet */}
      {selectedNpc && (
        <NpcDetailSheet
          npcName={selectedNpc}
          notes={selectedNotes}
          isGm={isGm}
          onClose={() => setSelectedNpc(null)}
          onAdd={(text) => handleAddNote(selectedNpc, text)}
          onEdit={handleEditNote}
          onDelete={handleDelete}
          onToggleShared={() => handleToggleShared(selectedNpc)}
          addingSaving={addNoteMutation.isPending}
          editingSaving={updateMutation.isPending}
        />
      )}

      {/* Create sheet */}
      {creating && (
        <CreateNpcSheet
          npcNames={npcNames}
          onSave={(data) => createMutation.mutate(data)}
          onClose={() => setCreating(false)}
          saving={createMutation.isPending}
        />
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        title="¿Eliminar esta nota?"
        message="Esta acción no se puede deshacer."
        onConfirm={() => {
          deleteMutation.mutate(confirmDelete.id!)
          setConfirmDelete({ open: false, id: null })
        }}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </div>
  )
}
