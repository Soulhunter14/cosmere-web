import { useId, type CSSProperties } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck } from 'lucide-react'
import { notesApi } from '../../api/notes'
import { Avatar, Button, Card, EmptyState, PageHeader, SectionTitle, Spinner } from '../../components/ui'
import { c, font, fs, page, shadow } from '../../theme'
import type { Note } from '../../types'

const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }

const formatNoteDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

/** One private message from the GM. Unread ones carry the Stormlight rail and the mark-as-read action. */
function NoteCard({
  note,
  index,
  unread,
  onMarkRead,
  markPending,
  marking,
}: {
  note: Note
  index: number
  unread: boolean
  onMarkRead?: () => void
  markPending?: boolean
  marking?: boolean
}) {
  const id = useId()
  return (
    <Card
      as="li"
      padding={0}
      className="rise"
      style={{
        '--i': index,
        overflow: 'hidden',
        borderColor: unread ? 'var(--brand-border)' : c.border,
        background: unread ? c.s1 : 'color-mix(in srgb, var(--surface-1) 55%, transparent)',
        boxShadow: unread ? `inset 3px 0 0 var(--brand), ${shadow[1]}` : 'none',
      } as CSSProperties}
    >
      <article aria-labelledby={`${id}-from`} style={{ padding: unread ? '16px 16px 16px 19px' : 16 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Avatar name={note.fromDisplayName} size={36} tone="rubi" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              id={`${id}-from`}
              style={{
                fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2,
                color: unread ? c.text : c.muted,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {note.fromDisplayName}
              {unread && <span className="sr-only"> (no leído)</span>}
            </h3>
            <time dateTime={note.createdAt} style={{ display: 'block', fontSize: fs.xs, color: c.subtle, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
              {formatNoteDate(note.createdAt)}
            </time>
          </div>
          {unread ? (
            <span
              aria-hidden
              style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: c.brand, boxShadow: '0 0 10px var(--brand-glow)' }}
            />
          ) : (
            <CheckCheck size={16} aria-hidden style={{ color: c.subtle, flexShrink: 0 }} />
          )}
        </header>

        <p
          style={{
            fontFamily: font.display,
            fontSize: unread ? fs.lg : fs.md + 1,
            lineHeight: 1.55,
            color: unread ? c.text : c.muted,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
            margin: 0,
          }}
        >
          {note.content}
        </p>

        {unread && onMarkRead && (
          <div style={{ marginTop: 16 }}>
            <Button
              variant="secondary"
              icon={<CheckCheck size={16} aria-hidden style={{ color: c.brand }} />}
              onClick={onMarkRead}
              disabled={markPending}
              loading={marking}
              aria-label={`Marcar como leída: mensaje de ${note.fromDisplayName}`}
            >
              Marcar como leída
            </Button>
          </div>
        )}
      </article>
    </Card>
  )
}

export function NotasPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const qc = useQueryClient()
  const unreadId = useId()
  const readId = useId()

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
    <div style={page}>
      <PageHeader
        title="Mensajes"
        subtitle={
          unread.length > 0
            ? `${unread.length} mensaje${unread.length !== 1 ? 's' : ''} sin leer`
            : 'Todo al día'
        }
      />

      {notes.length === 0 ? (
        <EmptyState
          icon={<Bell size={22} aria-hidden />}
          title="Sin mensajes todavía"
          description="El GM puede enviarte mensajes privados aquí."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Unread */}
          {unread.length > 0 && (
            <section aria-labelledby={unreadId}>
              <SectionTitle id={unreadId}>Sin leer</SectionTitle>
              <ul style={listReset}>
                {unread.map((note, i) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    index={i}
                    unread
                    onMarkRead={() => markReadMutation.mutate(note.id)}
                    markPending={markReadMutation.isPending}
                    marking={markReadMutation.isPending && markReadMutation.variables === note.id}
                  />
                ))}
              </ul>
            </section>
          )}

          {/* Read */}
          {read.length > 0 && (
            <section aria-labelledby={readId}>
              <SectionTitle id={readId}>Leídas</SectionTitle>
              <ul style={listReset}>
                {read.map((note, i) => (
                  <NoteCard key={note.id} note={note} index={unread.length + i} unread={false} />
                ))}
              </ul>
            </section>
          )}

        </div>
      )}
    </div>
  )
}
