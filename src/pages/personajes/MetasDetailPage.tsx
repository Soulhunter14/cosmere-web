import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Target, CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react'
import { metasApi } from '../../api/metas'
import { charactersApi } from '../../api/characters'
import { Spinner } from '../../components/ui'
import type { Meta, ConcludeMetaRequest } from '../../types'
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

const CONCLUSION_OPTIONS: { value: ConcludeMetaRequest['tipoConclusion']; label: string; color: string }[] = [
  { value: 'exito', label: 'Éxito', color: '#34d399' },
  { value: 'crecimiento', label: 'Crecimiento', color: '#60a5fa' },
  { value: 'fracaso', label: 'Fracaso', color: '#f87171' },
]

// ─── Hito checkboxes ──────────────────────────────────────────────────────

function HitoCheckboxes({ hitos, onChange }: { hitos: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3].map((n) => (
        <button
          key={n}
          onClick={() => onChange(hitos >= n ? n - 1 : n)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: hitos >= n ? 'var(--brand-light)' : 'var(--text-subtle)', display: 'flex' }}
        >
          {hitos >= n ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>
      ))}
    </div>
  )
}

// ─── Single meta card ──────────────────────────────────────────────────────

function MetaCard({ meta, campaignId, characterId }: { meta: Meta; campaignId: number; characterId: number }) {
  const qc = useQueryClient()
  const [showConclusion, setShowConclusion] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [conclusionType, setConclusionType] = useState<ConcludeMetaRequest['tipoConclusion']>('exito')
  const [conclusionNote, setConclusionNote] = useState('')
  const [expanded, setExpanded] = useState(meta.estado === 'activa')
  const isConcluida = meta.estado === 'concluida'
  const conclusionInfo = CONCLUSION_OPTIONS.find((o) => o.value === meta.tipoConclusion) ?? null

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

  return (
    <div style={{
      background: 'var(--surface-1)',
      border: `1px solid ${isConcluida ? 'var(--border)' : 'rgba(180,190,254,0.2)'}`,
      borderLeft: `3px solid ${isConcluida ? (conclusionInfo?.color ?? 'var(--border)') : 'var(--brand-light)'}`,
      borderRadius: 14,
      opacity: isConcluida ? 0.75 : 1,
    }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', cursor: 'pointer' }}
        onClick={() => setExpanded((e) => !e)}
      >
        <Target size={15} style={{ color: isConcluida ? 'var(--text-subtle)' : 'var(--brand-light)', flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: isConcluida ? 'var(--text-muted)' : 'var(--text)' }}>
          {meta.titulo}
        </span>
        {conclusionInfo && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: `${conclusionInfo.color}20`, color: conclusionInfo.color }}>
            {conclusionInfo.label}
          </span>
        )}
        {expanded ? <ChevronUp size={14} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />}
      </div>

      {expanded && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {meta.descripcion && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{meta.descripcion}</p>
          )}

          {!isConcluida && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600 }}>HITOS</span>
                <HitoCheckboxes hitos={meta.hitos} onChange={(n) => updateMutation.mutate(n)} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {meta.hitos === 3 && (
                  <button
                    onClick={() => setShowConclusion(true)}
                    style={{ padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: 'rgba(180,190,254,0.12)', border: '1px solid rgba(180,190,254,0.25)', color: 'var(--brand-light)' }}
                  >
                    Concluir
                  </button>
                )}
                <button
                  onClick={() => setShowDelete(true)}
                  style={{ padding: 6, borderRadius: 8, cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-subtle)', display: 'flex' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )}

          {isConcluida && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3].map((n) => (
                  <CheckCircle2 key={n} size={18} style={{ color: conclusionInfo?.color ?? 'var(--text-subtle)' }} />
                ))}
              </div>
              <button onClick={() => setShowDelete(true)} style={{ padding: 6, borderRadius: 8, cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-subtle)', display: 'flex' }}>
                <Trash2 size={13} />
              </button>
            </div>
          )}

          {meta.notasConclusion && (
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', fontStyle: 'italic', margin: 0 }}>"{meta.notasConclusion}"</p>
          )}
        </div>
      )}

      {/* Conclude sheet */}
      {showConclusion && (
        <>
          <div onClick={() => setShowConclusion(false)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 51, background: 'var(--surface-1)', borderRadius: '20px 20px 0 0', border: '1px solid var(--border-bright)', borderBottom: 'none', padding: '20px 20px calc(20px + var(--sab, 0px))', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Concluir meta</span>
              <button onClick={() => setShowConclusion(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 4 }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {CONCLUSION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setConclusionType(opt.value)}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, border: `1px solid ${conclusionType === opt.value ? opt.color : 'var(--border)'}`, background: conclusionType === opt.value ? `${opt.color}18` : 'var(--surface-2)', color: conclusionType === opt.value ? opt.color : 'var(--text-muted)' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <textarea
              value={conclusionNote}
              onChange={(e) => setConclusionNote(e.target.value)}
              placeholder="Nota final (opcional)..."
              rows={3}
              style={{ width: '100%', resize: 'none', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box', outline: 'none' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(180,190,254,0.3)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              onClick={() => concludeMutation.mutate()}
              disabled={concludeMutation.isPending}
              style={{ padding: 11, borderRadius: 10, cursor: 'pointer', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, opacity: concludeMutation.isPending ? 0.6 : 1 }}
            >
              {concludeMutation.isPending ? 'Guardando...' : 'Confirmar conclusión'}
            </button>
          </div>
        </>
      )}

      {/* Delete confirmation */}
      {showDelete && (
        <>
          <div onClick={() => setShowDelete(false)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 51, background: 'var(--surface-1)', borderRadius: '20px 20px 0 0', border: '1px solid var(--border-bright)', borderBottom: 'none', padding: '20px 20px calc(20px + var(--sab, 0px))', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>¿Eliminar esta meta?</span>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDelete(false)} style={{ flex: 1, padding: 11, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} style={{ flex: 1, padding: 11, borderRadius: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: deleteMutation.isPending ? 0.6 : 1 }}>
                Eliminar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export function MetasDetailPage() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const cId = Number(campaignId)
  const charId = Number(characterId)

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
  const gradient = AVATAR_GRADIENTS[character.id % AVATAR_GRADIENTS.length]

  const order = RADIANT_ORDERS.find((o) => o.id === character.caminoRadiante)
  const path = HEROIC_PATHS.find((p) => p.id === character.caminoHeroico)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Hero header — matches CharacterDetailPage structure exactly */}
      <div style={{
        background: gradient,
        padding: '28px 20px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Noise overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12, mixBlendMode: 'overlay', pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              {character.name}
            </h1>
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'white',
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 20, padding: '2px 8px', letterSpacing: '0.04em', whiteSpace: 'nowrap',
            }}>
              Nv. {character.level}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 3 }}>
            {path && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}>
                {path.icon} {path.name}
              </span>
            )}
            {order && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <RadiantOrderIcon orderId={order.id} size={10} />
                {order.name}
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4, margin: 0 }}>
            Metas
          </p>
        </div>
      </div>

      <div style={{ padding: '20px 16px 48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {activas.length === 0 && !showForm && (
            <p style={{ fontSize: 13, color: 'var(--text-subtle)', margin: '0 0 4px' }}>Sin metas activas.</p>
          )}

          {activas.map((meta) => (
            <MetaCard key={meta.id} meta={meta} campaignId={cId} characterId={charId} />
          ))}

          {showForm ? (
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-bright)', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título de la meta..."
                autoFocus
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(180,190,254,0.3)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción (opcional)..."
                rows={2}
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', lineHeight: 1.5, resize: 'none', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(180,190,254,0.3)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setShowForm(false); setTitulo(''); setDescripcion('') }} style={{ flex: 1, padding: 8, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={!titulo.trim() || createMutation.isPending}
                  style={{ flex: 1, padding: 8, borderRadius: 8, background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: !titulo.trim() || createMutation.isPending ? 0.5 : 1 }}
                >
                  Crear meta
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 10, cursor: 'pointer', background: 'transparent', border: '1.5px dashed var(--border-bright)', color: 'var(--text-subtle)', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(180,190,254,0.3)'; e.currentTarget.style.color = 'var(--brand-light)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-subtle)' }}
            >
              <Plus size={14} />
              Nueva meta
            </button>
          )}

          {concluidas.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <button
                onClick={() => setShowConcluidas((s) => !s)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', padding: '4px 0' }}
              >
                {showConcluidas ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                CONCLUIDAS ({concluidas.length})
              </button>
              {showConcluidas && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {concluidas.map((meta) => (
                    <MetaCard key={meta.id} meta={meta} campaignId={cId} characterId={charId} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
