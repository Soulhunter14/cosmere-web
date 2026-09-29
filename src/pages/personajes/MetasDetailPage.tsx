import { Fragment, useId, useState, type CSSProperties } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Target, Check, Trash2, ChevronDown, Flag, Trophy, Sprout, CircleX, type LucideIcon } from 'lucide-react'
import { metasApi } from '../../api/metas'
import { charactersApi } from '../../api/characters'
import { Button, Card, ConfirmDialog, EmptyState, Field, IconButton, Input, SectionTitle, Segmented, Sheet, Spinner, Textarea } from '../../components/ui'
import type { Meta, ConcludeMetaRequest } from '../../types'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import { RADIANT_ORDERS } from '../../data/radiantOrders'
import { RadiantOrderIcon } from '../../components/RadiantOrderIcon'
import { HeroicPathIcon } from '../../components/GameIcons'
import { CharacterHero } from '../../components/CharacterHero'
import { heroPill, onGem, onGemSoft } from '../../lib/hero'
import { buttonReset, c, eyebrow, font, fs, numeral, pill, radius, shadow, titleText, tone, type ToneName } from '../../theme'

/* Text on the CharacterHero gradient (see components/CharacterHero.tsx: ≥ 7:1 on every palette) */
const HERO_TEXT = onGem
const HERO_TEXT_SOFT = onGemSoft

/** 0 on phones, `px` from 640px (same framing as the character sheet hero: full-bleed on phones, a card from tablet) */
const fromTablet = (px: number) => `clamp(0px, calc((100vw - 640px) * 999), ${px}px)`

const TOTAL_HITOS = 3

const CONCLUSION_OPTIONS: { value: ConcludeMetaRequest['tipoConclusion']; label: string; tone: ToneName; icon: LucideIcon }[] = [
  { value: 'exito', label: 'Éxito', tone: 'esmeralda', icon: Trophy },
  { value: 'crecimiento', label: 'Crecimiento', tone: 'zafiro', icon: Sprout },
  { value: 'fracaso', label: 'Fracaso', tone: 'rubi', icon: CircleX },
]

// ─── Hito checkboxes (0-3 progress stepper) ───────────────────────────────

function HitoCheckboxes({ hitos, onChange }: { hitos: number; onChange: (n: number) => void }) {
  return (
    <div role="group" aria-label={`Hitos: ${hitos} de ${TOTAL_HITOS}`} style={{ display: 'flex', alignItems: 'center' }}>
      {[1, 2, 3].map((n) => {
        const done = hitos >= n
        return (
          <Fragment key={n}>
            {n > 1 && (
              <span
                aria-hidden
                style={{
                  width: 22, height: 2, margin: '0 -7px', borderRadius: 2, pointerEvents: 'none',
                  background: done ? c.brand : c.track,
                  transition: 'background var(--dur-2)',
                }}
              />
            )}
            <IconButton
              label={`Hito ${n} de ${TOTAL_HITOS}, ${done ? 'completado' : 'pendiente'}`}
              size={44}
              onClick={() => onChange(hitos >= n ? n - 1 : n)}
              style={{ borderRadius: radius.full }}
            >
              <span
                aria-hidden
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? c.brandFill : c.s2,
                  border: `1.5px solid ${done ? c.brandFill : c.borderStrong}`,
                  boxShadow: done ? '0 0 0 3px var(--brand-bg)' : 'none',
                  color: done ? c.onBrand : c.muted,
                  ...numeral, fontSize: fs.sm,
                  transition: 'background var(--dur-2), border-color var(--dur-2), box-shadow var(--dur-2)',
                }}
              >
                {done ? <Check size={16} strokeWidth={3} /> : n}
              </span>
            </IconButton>
          </Fragment>
        )
      })}
    </div>
  )
}

// ─── Single meta card ──────────────────────────────────────────────────────

function MetaCard({ meta, campaignId, characterId, index = 0 }: { meta: Meta; campaignId: number; characterId: number; index?: number }) {
  const qc = useQueryClient()
  const bodyId = useId()
  const [showConclusion, setShowConclusion] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [conclusionType, setConclusionType] = useState<ConcludeMetaRequest['tipoConclusion']>('exito')
  const [conclusionNote, setConclusionNote] = useState('')
  const [expanded, setExpanded] = useState(meta.estado === 'activa')
  const isConcluida = meta.estado === 'concluida'
  const conclusionInfo = CONCLUSION_OPTIONS.find((o) => o.value === meta.tipoConclusion) ?? null
  const accent = isConcluida ? (conclusionInfo ? tone[conclusionInfo.tone] : tone.cuarzo) : tone.brand
  const selectedTone = CONCLUSION_OPTIONS.find((o) => o.value === conclusionType)?.tone ?? 'brand'
  const r = radius.lg - 1

  const updateMutation = useMutation({
    mutationFn: (hitos: number) =>
      metasApi.update(campaignId, characterId, meta.id, { titulo: meta.titulo, descripcion: meta.descripcion, hitos }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['metas', campaignId, characterId] }),
  })

  const concludeMutation = useMutation({
    mutationFn: () =>
      metasApi.conclude(campaignId, characterId, meta.id, { tipoConclusion: conclusionType, notasConclusion: conclusionNote }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['metas', campaignId, characterId] }); setShowConclusion(false) },
  })

  const deleteMutation = useMutation({
    mutationFn: () => metasApi.delete(campaignId, characterId, meta.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['metas', campaignId, characterId] }),
  })

  const ConclusionIcon = conclusionInfo?.icon

  return (
    <Card
      as="li"
      padding={0}
      className="rise"
      style={{
        '--i': Math.min(index, 10),
        border: `1px solid ${isConcluida ? c.border : 'var(--brand-border)'}`,
        boxShadow: `inset 3px 0 0 ${accent.fg}, ${shadow[1]}`,
      } as CSSProperties}
    >
      <h3 style={{ margin: 0 }}>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setExpanded((e) => !e)}
          className="ui-row"
          style={{
            ...buttonReset,
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px 12px 18px', minHeight: 60,
            fontFamily: font.ui, fontWeight: 400,
            borderRadius: expanded ? `${r}px ${r}px 0 0` : r,
            outlineOffset: -2,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 34, height: 34, flexShrink: 0, borderRadius: radius.sm,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: accent.bg, border: `1px solid ${accent.border}`, color: accent.fg,
            }}
          >
            <Target size={17} />
          </span>
          {/* Title + conclusion badge: the badge wraps under long titles instead of squeezing them */}
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 10, rowGap: 6 }}>
            <span
              style={{
                flex: '0 1 auto', minWidth: 0,
                fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.25,
                color: isConcluida ? c.muted : c.text, overflowWrap: 'anywhere',
              }}
            >
              {meta.titulo}
            </span>
            {conclusionInfo && ConclusionIcon && (
              <span style={pill(tone[conclusionInfo.tone])}>
                <ConclusionIcon size={13} aria-hidden />
                {conclusionInfo.label}
              </span>
            )}
          </span>
          <ChevronDown
            size={18}
            aria-hidden
            style={{ color: c.subtle, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-2) var(--ease-out)' }}
          />
        </button>
      </h3>

      {expanded && (
        <div id={bodyId} className="fade-in" style={{ padding: '0 16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {meta.descripcion && (
            <p style={{ fontSize: fs.base, color: c.muted, lineHeight: 1.55 }}>{meta.descripcion}</p>
          )}

          {!isConcluida && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span aria-hidden style={eyebrow}>Hitos</span>
                  <HitoCheckboxes hitos={meta.hitos} onChange={(n) => updateMutation.mutate(n)} />
                </div>
                <IconButton label="Eliminar meta" variant="danger" size={44} onClick={() => setShowDelete(true)}>
                  <Trash2 size={18} aria-hidden />
                </IconButton>
              </div>
              {/* All hitos done: the conclusion is the card's call to action */}
              {meta.hitos === 3 && (
                <Button size="md" fullWidth icon={<Flag size={16} aria-hidden />} aria-haspopup="dialog" onClick={() => setShowConclusion(true)}>
                  Concluir
                </Button>
              )}
            </div>
          )}

          {isConcluida && (
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                paddingTop: 10, borderTop: `1px solid ${c.border}`,
              }}
            >
              <div role="img" aria-label={`Hitos: ${TOTAL_HITOS} de ${TOTAL_HITOS}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden style={eyebrow}>Hitos</span>
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    aria-hidden
                    style={{
                      width: 26, height: 26, borderRadius: '50%',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      background: accent.bg, border: `1px solid ${accent.border}`, color: accent.fg,
                    }}
                  >
                    <Check size={14} strokeWidth={3} />
                  </span>
                ))}
              </div>
              <IconButton label="Eliminar meta" variant="danger" size={44} onClick={() => setShowDelete(true)}>
                <Trash2 size={18} aria-hidden />
              </IconButton>
            </div>
          )}

          {meta.notasConclusion && (
            <blockquote
              style={{
                margin: 0, padding: '2px 0 2px 12px',
                borderLeft: '2px solid var(--gold-border)',
                fontFamily: font.display, fontStyle: 'italic', fontSize: fs.md, lineHeight: 1.5, color: c.muted,
              }}
            >
              "{meta.notasConclusion}"
            </blockquote>
          )}
        </div>
      )}

      {/* Conclude sheet */}
      <Sheet
        open={showConclusion}
        onClose={() => setShowConclusion(false)}
        title="Concluir meta"
        description={meta.titulo}
        maxWidth={480}
        footer={
          <>
            <Button variant="secondary" size="lg" onClick={() => setShowConclusion(false)} style={{ flex: 1 }}>
              Cancelar
            </Button>
            <Button
              size="lg"
              onClick={() => concludeMutation.mutate()}
              disabled={concludeMutation.isPending}
              aria-busy={concludeMutation.isPending || undefined}
              style={{ flex: 2 }}
            >
              {concludeMutation.isPending ? 'Guardando...' : 'Confirmar conclusión'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Segmented<ConcludeMetaRequest['tipoConclusion']>
            ariaLabel="Tipo de conclusión"
            value={conclusionType}
            onChange={setConclusionType}
            tone={selectedTone}
            options={CONCLUSION_OPTIONS.map((opt) => {
              const Icon = opt.icon
              return { value: opt.value, label: <><Icon size={16} aria-hidden />{opt.label}</> }
            })}
            style={{ minHeight: 48 }}
          />
          <Field label="Nota final (opcional)">
            <Textarea
              value={conclusionNote}
              onChange={(e) => setConclusionNote(e.target.value)}
              placeholder="Nota final (opcional)..."
              rows={3}
            />
          </Field>
        </div>
      </Sheet>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDelete}
        title="¿Eliminar esta meta?"
        message="Esta acción no se puede deshacer."
        loading={deleteMutation.isPending}
        onConfirm={() => { if (!deleteMutation.isPending) deleteMutation.mutate() }}
        onCancel={() => setShowDelete(false)}
      />
    </Card>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export function MetasDetailPage() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const cId = Number(campaignId)
  const charId = Number(characterId)
  const activasId = useId()
  const concluidasId = useId()
  const concluidasTitleId = useId()

  const { data: character, isLoading } = useQuery({
    queryKey: ['character', cId, charId],
    queryFn: () => charactersApi.getById(cId, charId),
  })

  const [showForm, setShowForm] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [showConcluidas, setShowConcluidas] = useState(false)
  const qc = useQueryClient()

  const { data: metas = [], isLoading: metasLoading } = useQuery({
    queryKey: ['metas', cId, charId],
    queryFn: () => metasApi.getAll(cId, charId),
    enabled: !!character,
  })

  const createMutation = useMutation({
    mutationFn: () => metasApi.create(cId, charId, { titulo, descripcion }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['metas', cId, charId] })
      setTitulo(''); setDescripcion(''); setShowForm(false)
    },
  })

  if (isLoading || metasLoading) return <Spinner />
  if (!character) return null

  const activas = metas.filter((m) => m.estado === 'activa')
  const concluidas = metas.filter((m) => m.estado === 'concluida')

  const order = RADIANT_ORDERS.find((o) => o.id === character.caminoRadiante)
  const path = HEROIC_PATHS.find((p) => p.id === character.caminoHeroico)

  const listStyle: CSSProperties = { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Hero header */}
      <CharacterHero
        characterId={character.id}
        style={{ borderRadius: fromTablet(radius.lg), marginTop: fromTablet(16), borderBottom: 'none' }}
      >
        <p style={{ ...eyebrow, color: HERO_TEXT_SOFT, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Target size={14} aria-hidden />
          Metas
        </p>
        <h1 style={{ ...titleText, fontSize: fs['2xl'], color: HERO_TEXT, marginBottom: 12, overflowWrap: 'anywhere' }}>
          {character.name}
        </h1>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ ...heroPill, fontVariantNumeric: 'tabular-nums' }}>Nv. {character.level}</span>
          {path && (
            <span style={heroPill}>
              <HeroicPathIcon id={path.id} size={13} />
              {path.name}
            </span>
          )}
          {order && (
            <span style={heroPill}>
              <RadiantOrderIcon orderId={order.id} size={16} decorative />
              {order.name}
            </span>
          )}
        </div>
      </CharacterHero>

      <div style={{ padding: '24px 16px 48px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Active metas */}
        <section aria-labelledby={activasId}>
          <SectionTitle id={activasId}>Activas</SectionTitle>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activas.length === 0 && !showForm && (
              <EmptyState
                icon={<Target size={22} aria-hidden />}
                title="Sin metas activas."
                style={{ padding: '28px 20px' }}
                action={
                  <Button icon={<Plus size={16} aria-hidden />} onClick={() => setShowForm(true)}>
                    Nueva meta
                  </Button>
                }
              />
            )}

            {activas.length > 0 && (
              <ul role="list" style={listStyle}>
                {activas.map((meta, i) => (
                  <MetaCard key={meta.id} meta={meta} campaignId={cId} characterId={charId} index={i} />
                ))}
              </ul>
            )}

            {showForm ? (
              <Card padding={16} className="pop-in" style={{ border: '1px solid var(--brand-border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Título de la meta">
                  <Input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Título de la meta..."
                    autoFocus
                  />
                </Field>
                <Field label="Descripción (opcional)">
                  <Textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripción (opcional)..."
                    rows={2}
                  />
                </Field>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button variant="secondary" onClick={() => { setShowForm(false); setTitulo(''); setDescripcion('') }} style={{ flex: 1 }}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => createMutation.mutate()}
                    disabled={!titulo.trim() || createMutation.isPending}
                    aria-busy={createMutation.isPending || undefined}
                    style={{ flex: 1 }}
                  >
                    Crear meta
                  </Button>
                </div>
              </Card>
            ) : activas.length > 0 && (
              <Button
                variant="ghost"
                fullWidth
                icon={<Plus size={16} aria-hidden />}
                onClick={() => setShowForm(true)}
                style={{ border: `1px dashed ${c.borderStrong}`, color: c.brand, minHeight: 48 }}
              >
                Nueva meta
              </Button>
            )}
          </div>
        </section>

        {/* Concluded metas */}
        {concluidas.length > 0 && (
          <section aria-labelledby={concluidasTitleId}>
            <SectionTitle id={concluidasTitleId}>
              <button
                type="button"
                aria-expanded={showConcluidas}
                aria-controls={concluidasId}
                onClick={() => setShowConcluidas((s) => !s)}
                className="ui-row"
                style={{
                  ...buttonReset,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  minHeight: 44, padding: '0 10px 0 4px', marginLeft: -4, borderRadius: radius.sm,
                }}
              >
                <ChevronDown
                  size={18}
                  aria-hidden
                  style={{ color: c.subtle, transform: showConcluidas ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-2) var(--ease-out)' }}
                />
                Concluidas ({concluidas.length})
              </button>
            </SectionTitle>
            {showConcluidas && (
              <ul id={concluidasId} role="list" style={listStyle}>
                {concluidas.map((meta, i) => (
                  <MetaCard key={meta.id} meta={meta} campaignId={cId} characterId={charId} index={i} />
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
