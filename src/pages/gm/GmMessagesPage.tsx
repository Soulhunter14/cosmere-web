import { useId, useState, type CSSProperties } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, MessageSquare, Check, Users } from 'lucide-react'
import { notesApi } from '../../api/notes'
import { useCampaignStore } from '../../store/campaignStore'
import { Avatar, Badge, Button, Card, EmptyState, ErrorMessage, Field, PageHeader, SectionTitle, Spinner, Textarea } from '../../components/ui'
import { c, eyebrow, fs, page, pill, radius, tone } from '../../theme'
import type { CampaignDetail } from '../../types'

/* Toggle chip for a recipient (aria-pressed + a check mark, so the state is not carried by colour alone) */
const chipBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 44,
  padding: '0 14px 0 6px',
  borderRadius: radius.full,
  cursor: 'pointer',
  fontSize: fs.sm + 1,
  fontWeight: 600,
  whiteSpace: 'nowrap',
}
const chipOn: CSSProperties = {
  ...chipBase,
  border: `1px solid ${tone.brand.border}`,
  background: tone.brand.bg,
  color: c.brandLight,
}
const chipOff: CSSProperties = {
  ...chipBase,
  border: `1px solid ${c.borderBright}`,
  background: c.s2,
  color: c.muted,
}

export function GmMessagesPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const qc = useQueryClient()
  const { currentCampaign } = useCampaignStore()
  const uid = useId()
  const recipientsLabelId = `${uid}-recipients`
  const hintId = `${uid}-hint`

  const players = (currentCampaign as CampaignDetail | null)?.members?.filter((m) => m.role === 'player') ?? []

  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<number>>(new Set())
  const [content, setContent] = useState('')
  // "Mensaje enviado" confirmation: shown after a successful send, hidden as soon as the GM edits the form again
  const [sentNotice, setSentNotice] = useState(false)

  const allSelected = players.length > 0 && selectedPlayerIds.size === players.length

  function togglePlayer(id: number) {
    setSentNotice(false)
    setSelectedPlayerIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSentNotice(false)
    if (allSelected) {
      setSelectedPlayerIds(new Set())
    } else {
      setSelectedPlayerIds(new Set(players.map((p) => p.userId)))
    }
  }

  const { data: sentNotes = [], isLoading } = useQuery({
    queryKey: ['notes', cId],
    queryFn: () => notesApi.getAll(cId),
  })

  const sendMutation = useMutation({
    mutationFn: () => notesApi.create(cId, { toUserIds: [...selectedPlayerIds], content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes', cId] })
      setContent('')
      setSelectedPlayerIds(new Set())
    },
  })

  if (isLoading) return <Spinner />

  const sendDisabled = selectedPlayerIds.size === 0 || !content.trim() || sendMutation.isPending
  const justSent = sentNotice && sendMutation.isSuccess
  // Why the button is disabled (read by screen readers through aria-describedby)
  const hint = sendMutation.isPending || justSent
    ? null
    : selectedPlayerIds.size === 0
      ? 'Selecciona al menos un destinatario'
      : !content.trim()
        ? 'Escribe un mensaje'
        : null

  return (
    <div style={{ ...page, paddingBottom: 48 }}>
      <PageHeader title="Mensajes" subtitle="Envía mensajes privados a los jugadores" />

      {/* Send form */}
      <Card padding={16} style={{ marginBottom: 32 }}>
        <div role="group" aria-labelledby={recipientsLabelId}>
          <p id={recipientsLabelId} style={{ ...eyebrow, marginBottom: 10 }}>
            Destinatario
          </p>

          {players.length === 0 ? (
            <p style={{ fontSize: fs.sm + 1, color: c.muted, marginBottom: 16 }}>
              No hay jugadores en la campaña todavía.
            </p>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                type="button"
                onClick={toggleAll}
                aria-pressed={allSelected}
                className={allSelected ? 'ui-btn' : 'ui-btn ui-btn--secondary'}
                style={{ ...(allSelected ? chipOn : chipOff), paddingLeft: 12 }}
              >
                <Users size={18} aria-hidden />
                Todos
                {allSelected && <Check size={16} aria-hidden />}
              </button>
              {players.map((p) => {
                const active = selectedPlayerIds.has(p.userId)
                return (
                  <button
                    key={p.userId}
                    type="button"
                    onClick={() => togglePlayer(p.userId)}
                    aria-pressed={active}
                    className={active ? 'ui-btn' : 'ui-btn ui-btn--secondary'}
                    style={active ? chipOn : chipOff}
                  >
                    <Avatar name={p.displayName} size={30} tone="brand" />
                    {p.displayName}
                    {active && <Check size={16} aria-hidden />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <Field label="Mensaje">
          <Textarea
            value={content}
            onChange={(e) => { setSentNotice(false); setContent(e.target.value) }}
            placeholder="Escribe un mensaje privado..."
            rows={3}
          />
        </Field>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px 14px', marginTop: 14 }}>
          <Button
            onClick={() => { setSentNotice(false); sendMutation.mutate(undefined, { onSuccess: () => setSentNotice(true) }) }}
            disabled={sendDisabled}
            loading={sendMutation.isPending}
            icon={<Send size={16} aria-hidden />}
            aria-describedby={hint ? hintId : undefined}
          >
            {sendMutation.isPending ? 'Enviando...' : 'Enviar'}
          </Button>
          {hint && (
            <p id={hintId} style={{ fontSize: fs.sm, color: c.subtle }}>{hint}</p>
          )}
          <p role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: fs.sm, fontWeight: 600, color: tone.esmeralda.fg }}>
            {justSent && (
              <>
                <Check size={16} aria-hidden />
                Mensaje enviado
              </>
            )}
          </p>
        </div>

        {sendMutation.isError && (
          <ErrorMessage message="No se pudo enviar el mensaje. Inténtalo de nuevo." style={{ marginTop: 14 }} />
        )}
      </Card>

      {/* Sent history */}
      <SectionTitle>Enviados</SectionTitle>

      {sentNotes.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={22} aria-hidden />}
          title="Sin mensajes enviados"
          description="Los mensajes que envíes aparecerán aquí."
        />
      ) : (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sentNotes.map((note, i) => (
            <Card
              key={note.id}
              as="li"
              padding="14px 16px"
              className="rise"
              style={{ '--i': Math.min(i, 12) } as CSSProperties}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                <span style={{ ...pill(tone.brand), color: c.brandLight, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <span aria-hidden>→</span>
                  <span className="sr-only">Para</span>
                  {note.toDisplayName}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {note.isRead && (
                    <Badge variant="success">
                      <Check size={13} aria-hidden /> Leído
                    </Badge>
                  )}
                  <time dateTime={note.createdAt} style={{ fontSize: fs.xs, color: c.subtle, fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(note.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
              </div>
              <p style={{ fontSize: fs.base, color: c.text, lineHeight: 1.55, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {note.content}
              </p>
            </Card>
          ))}
        </ul>
      )}
    </div>
  )
}
