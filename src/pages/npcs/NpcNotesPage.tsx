import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X, Edit2, Trash2, Share2, BookUser, ChevronRight, Clock } from 'lucide-react'
import { npcNotesApi } from '../../api/npcNotes'
import { globalNpcsApi } from '../../api/global-npcs'
import { useCampaignStore } from '../../store/campaignStore'
import { Spinner, ConfirmDialog } from '../../components/ui'
import type { NpcNote } from '../../types'

const AVATAR_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#4ade80', '#34d399',
  '#60a5fa', '#a78bfa', '#f472b6', '#94a3b8', '#2dd4bf',
]

function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

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
  const color = avatarColor(npcName)

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71,
        background: 'var(--surface-1)', borderRadius: '20px 20px 0 0',
        border: '1px solid var(--border-bright)', borderBottom: 'none',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        paddingBottom: 'calc(16px + var(--sab, 0px))',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px 0', flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `${color}22`, border: `1px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color,
          }}>
            {npcName[0]?.toUpperCase() ?? '?'}
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {npcName}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-subtle)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Shared toggle — only if player has own notes */}
        {ownNotes.length > 0 && (
          <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
            <button
              onClick={onToggleShared}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 10, border: `1px solid ${isShared ? 'rgba(96,165,250,0.35)' : 'var(--border)'}`,
                background: isShared ? 'rgba(96,165,250,0.08)' : 'var(--surface-2)',
                cursor: 'pointer', width: '100%', textAlign: 'left',
              }}
            >
              <Share2 size={14} style={{ color: isShared ? '#60a5fa' : 'var(--text-subtle)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: isShared ? '#60a5fa' : 'var(--text)' }}>
                  Compartir con jugadores
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                  {isShared ? 'Todos pueden ver las notas de este NPC' : 'Solo tú puedes ver estas notas'}
                </div>
              </div>
              <div style={{
                width: 32, height: 18, borderRadius: 9, flexShrink: 0, transition: 'background 0.2s',
                background: isShared ? '#60a5fa' : 'rgba(255,255,255,0.12)', position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: 2, left: isShared ? 16 : 2,
                  width: 14, height: 14, borderRadius: '50%', background: 'white', transition: 'left 0.2s',
                }} />
              </div>
            </button>
          </div>
        )}

        {/* Notes list */}
        <div style={{ overflowY: 'auto', padding: '12px 20px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Own notes */}
          {ownNotes.map((note) => (
            <div key={note.id} style={{
              background: 'var(--surface-2)', borderRadius: 12, padding: '12px 14px',
              border: '1px solid var(--border)',
            }}>
              {editingId === note.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                    autoFocus
                    style={{
                      width: '100%', background: 'var(--surface-1)', border: '1px solid var(--border-bright)',
                      borderRadius: 8, padding: '8px 10px', color: 'var(--text)', fontSize: 13,
                      resize: 'vertical' as const, outline: 'none', boxSizing: 'border-box' as const, lineHeight: 1.6,
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { onEdit(note, editText); setEditingId(null) }}
                      disabled={!editText.trim() || editingSaving}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: 'white',
                        fontSize: 12, fontWeight: 600, opacity: !editText.trim() || editingSaving ? 0.5 : 1,
                      }}
                    >
                      {editingSaving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
                        cursor: 'pointer', background: 'var(--surface-1)', color: 'var(--text-subtle)', fontSize: 12,
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: 0, flex: 1, whiteSpace: 'pre-wrap' }}>
                      {note.notes || <em style={{ color: 'var(--text-subtle)' }}>Sin texto</em>}
                    </p>
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      <button
                        onClick={() => { setEditingId(note.id); setEditText(note.notes) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, color: 'var(--text-subtle)', borderRadius: 6, display: 'flex' }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => onDelete(note.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, color: 'var(--text-subtle)', borderRadius: 6, display: 'flex' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <Clock size={10} style={{ color: 'var(--text-subtle)' }} />
                    <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{formatDate(note.updatedAt)}</span>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Others' notes */}
          {othersNotes.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginTop: 4 }}>
                DE OTROS JUGADORES
              </div>
              {othersNotes.map((note) => (
                <div key={note.id} style={{
                  background: 'var(--surface-2)', borderRadius: 12, padding: '12px 14px',
                  border: '1px solid rgba(96,165,250,0.15)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa', flex: 1 }}>
                      por {note.authorName}
                    </span>
                    {isGm && (
                      <button
                        onClick={() => onDelete(note.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, color: 'var(--text-subtle)', borderRadius: 4, display: 'flex' }}
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{note.notes}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <Clock size={10} style={{ color: 'var(--text-subtle)' }} />
                    <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{formatDate(note.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Add note inline */}
          {addOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
              <textarea
                value={addText}
                onChange={(e) => setAddText(e.target.value)}
                placeholder="Escribe la nota..."
                rows={4}
                autoFocus
                style={{
                  width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
                  borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontSize: 13,
                  resize: 'vertical' as const, outline: 'none', boxSizing: 'border-box' as const, lineHeight: 1.6,
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { onAdd(addText); setAddText(''); setAddOpen(false) }}
                  disabled={!addText.trim() || addingSaving}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: 'white',
                    fontSize: 13, fontWeight: 600, opacity: !addText.trim() || addingSaving ? 0.5 : 1,
                    boxShadow: '0 2px 10px rgba(139,92,246,0.3)',
                  }}
                >
                  {addingSaving ? 'Guardando...' : 'Guardar nota'}
                </button>
                <button
                  onClick={() => { setAddOpen(false); setAddText('') }}
                  style={{
                    padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)',
                    cursor: 'pointer', background: 'var(--surface-2)', color: 'var(--text-subtle)', fontSize: 13,
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px',
                borderRadius: 10, border: '1.5px dashed var(--border-bright)',
                background: 'transparent', cursor: 'pointer', color: 'var(--text-subtle)',
                fontSize: 13, width: '100%',
              }}
            >
              <Plus size={14} />
              Añadir nota
            </button>
          )}
          <div style={{ height: 8 }} />
        </div>
      </div>
    </>
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
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71,
        background: 'var(--surface-1)', borderRadius: '20px 20px 0 0',
        border: '1px solid var(--border-bright)', borderBottom: 'none',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        paddingBottom: 'calc(16px + var(--sab, 0px))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 16px', flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Nueva nota de NPC</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-subtle)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* NPC Name with autocomplete */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              NOMBRE DEL NPC
            </label>
            <input
              list="npc-names-list"
              placeholder="Nombre del NPC..."
              value={form.npcName}
              onChange={(e) => setForm((p) => ({ ...p, npcName: e.target.value }))}
              autoFocus
              style={{
                width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontSize: 15,
                fontWeight: 600, outline: 'none', boxSizing: 'border-box' as const,
              }}
            />
            <datalist id="npc-names-list">
              {npcNames.map((name) => <option key={name} value={name} />)}
            </datalist>
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              NOTA
            </label>
            <textarea
              placeholder="Escribe tu primera nota sobre este NPC..."
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={5}
              style={{
                width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontSize: 13,
                resize: 'vertical' as const, outline: 'none', boxSizing: 'border-box' as const, lineHeight: 1.6,
              }}
            />
          </div>

          {/* Shared toggle */}
          <button
            onClick={() => setForm((p) => ({ ...p, isShared: !p.isShared }))}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderRadius: 12, border: `1px solid ${form.isShared ? 'rgba(96,165,250,0.35)' : 'var(--border)'}`,
              background: form.isShared ? 'rgba(96,165,250,0.08)' : 'var(--surface-2)',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <Share2 size={16} style={{ color: form.isShared ? '#60a5fa' : 'var(--text-subtle)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: form.isShared ? '#60a5fa' : 'var(--text)' }}>
                Compartir con jugadores
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 1 }}>
                {form.isShared ? 'Todos los jugadores pueden ver las notas de este NPC' : 'Solo tú puedes ver estas notas'}
              </div>
            </div>
            <div style={{
              width: 36, height: 20, borderRadius: 10, flexShrink: 0, transition: 'background 0.2s',
              background: form.isShared ? '#60a5fa' : 'rgba(255,255,255,0.12)', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 2, left: form.isShared ? 18 : 2,
                width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s',
              }} />
            </div>
          </button>

          {/* Save */}
          <button
            onClick={() => onSave(form)}
            disabled={!form.npcName.trim() || saving}
            style={{
              padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
              color: 'white', fontSize: 14, fontWeight: 700,
              opacity: !form.npcName.trim() || saving ? 0.5 : 1,
              boxShadow: '0 2px 12px rgba(139,92,246,0.35)',
            }}
          >
            {saving ? 'Guardando...' : 'Crear nota'}
          </button>
          <div style={{ height: 4 }} />
        </div>
      </div>
    </>
  )
}

// ─── NPC Group Card ───────────────────────────────────────────────────────────

function NpcGroupCard({ npcName, notes, onClick }: { npcName: string; notes: NpcNote[]; onClick: () => void }) {
  const color = avatarColor(npcName)
  const ownNotes = notes.filter((n) => n.isOwn)
  const othersNotes = notes.filter((n) => !n.isOwn)
  const isShared = ownNotes.some((n) => n.isShared)

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--surface-1)', border: '1px solid var(--border)',
        borderLeft: `3px solid ${color}`,
        borderRadius: 16, padding: '14px 16px',
        cursor: 'pointer', textAlign: 'left', width: '100%',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: `${color}22`, border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 800, color,
      }}>
        {npcName[0]?.toUpperCase() ?? '?'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{npcName}</span>
          {isShared && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, letterSpacing: '0.06em',
              background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa',
            }}>COMPARTIDA</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 11, color: 'var(--text-subtle)',
            background: 'var(--surface-2)', borderRadius: 6, padding: '1px 7px',
          }}>
            {notes.length} nota{notes.length !== 1 ? 's' : ''}
          </span>
          {othersNotes.length > 0 && ownNotes.length === 0 && (
            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
              · de {[...new Set(othersNotes.map((n) => n.authorName))].join(', ')}
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={16} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
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

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['npc-notes', cId],
    queryFn: () => npcNotesApi.getAll(cId),
  })

  const { data: globalNpcs = [] } = useQuery({
    queryKey: ['global-npcs'],
    queryFn: () => globalNpcsApi.getAll(),
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
    <div style={{ padding: '20px 16px 80px', maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>
            Notas de NPCs
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {ownGroups.length
              ? `${ownGroups.length} NPC${ownGroups.length !== 1 ? 's' : ''} anotado${ownGroups.length !== 1 ? 's' : ''}`
              : 'Sin notas todavía'}
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
            color: 'white', border: 'none', borderRadius: 10, padding: '8px 14px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
            boxShadow: '0 2px 10px rgba(139,92,246,0.35)',
          }}
        >
          <Plus size={14} /> Nueva nota
        </button>
      </div>

      {/* Empty state */}
      {notes.length === 0 && (
        <div style={{
          border: '1.5px dashed var(--border-bright)', borderRadius: 20,
          padding: '52px 32px', textAlign: 'center', background: 'var(--surface-1)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 16px',
            background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookUser size={20} style={{ color: 'var(--text-subtle)' }} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Sin notas todavía</h3>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 24 }}>
            Registra lo que sabes sobre los NPCs que encuentres en tu aventura.
          </p>
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
            <Plus size={13} /> Nueva nota
          </button>
        </div>
      )}

      {/* Own NPC groups */}
      {ownGroups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: othersGroups.length > 0 ? 28 : 0 }}>
          {ownGroups.map((name) => (
            <NpcGroupCard
              key={name}
              npcName={name}
              notes={grouped.get(name) ?? []}
              onClick={() => setSelectedNpc(name)}
            />
          ))}
        </div>
      )}

      {/* Others' NPC groups */}
      {othersGroups.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 10 }}>
            COMPARTIDAS POR OTROS JUGADORES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {othersGroups.map((name) => (
              <NpcGroupCard
                key={name}
                npcName={name}
                notes={grouped.get(name) ?? []}
                onClick={() => setSelectedNpc(name)}
              />
            ))}
          </div>
        </>
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
