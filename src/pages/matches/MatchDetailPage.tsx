import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Sparkles, Send } from 'lucide-react'
import { matchesApi } from '../../api/matches'
import { useCampaignStore } from '../../store/campaignStore'
import { Spinner } from '../../components/ui'

export function MatchDetailPage() {
  const { campaignId, matchId } = useParams<{ campaignId: string; matchId: string }>()
  const cId = Number(campaignId), mId = Number(matchId)
  const qc = useQueryClient()
  const { isGm } = useCampaignStore()
  const [sceneText, setSceneText] = useState('')
  const [resolution, setResolution] = useState('')
  const [finalizing, setFinalizing] = useState(false)

  const { data: match, isLoading } = useQuery({
    queryKey: ['match', cId, mId],
    queryFn: () => matchesApi.getById(cId, mId),
  })

  const addSceneMutation = useMutation({
    mutationFn: () => matchesApi.addScene(cId, mId, sceneText),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['match', cId, mId] })
      setSceneText('')
    },
  })

  const finalizeMutation = useMutation({
    mutationFn: () => matchesApi.finalize(cId, mId, resolution),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['match', cId, mId] })
      setFinalizing(false)
    },
  })

  if (isLoading || !match) return <Spinner />

  const isCompleted = match.isCompleted

  return (
    <div style={{ padding: '24px 20px', maxWidth: 600, margin: '0 auto' }}>

      {/* ── Hero header ───────────────────────────────────────── */}
      <div
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 24,
          background: isCompleted
            ? 'linear-gradient(135deg, #065f46, #047857)'
            : 'linear-gradient(135deg, #78350f, #92400e)',
          position: 'relative',
        }}
      >
        {/* noise overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12, mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px', pointerEvents: 'none',
        }} />

        <div style={{ padding: '20px 20px 18px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                {new Date(match.createdAt).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: 'white', lineHeight: 1.15 }}>
                Sesión #{match.id}
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
                {match.scenes.length} escena{match.scenes.length !== 1 ? 's' : ''}
              </p>
            </div>
            <span style={{
              flexShrink: 0,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 20,
              background: isCompleted ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
              border: isCompleted ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(245,158,11,0.35)',
              color: isCompleted ? '#6ee7b7' : '#fde68a',
              marginTop: 4,
            }}>
              {isCompleted ? 'Completada' : 'En curso'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Resolution (if completed) ─────────────────────────── */}
      {isCompleted && match.resolution && (
        <div
          style={{
            borderRadius: 16,
            padding: '16px 18px',
            marginBottom: 20,
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Sparkles size={14} style={{ color: '#34d399', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#34d399', marginBottom: 6 }}>
                Resolución
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
                {match.resolution}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Scenes timeline ───────────────────────────────────── */}
      {match.scenes.length > 0 && (
        <div
          style={{
            borderRadius: 16,
            padding: '16px 18px',
            marginBottom: 16,
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 16 }}>
            Escenas
          </p>
          <div>
            {match.scenes.map((scene, i) => (
              <div key={scene.id} style={{ display: 'flex', gap: 12, marginBottom: i < match.scenes.length - 1 ? 0 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'white',
                    background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  {i < match.scenes.length - 1 && (
                    <div style={{ width: 1, flex: 1, minHeight: 20, background: 'var(--border)', margin: '4px 0' }} />
                  )}
                </div>
                <div style={{ paddingTop: 4, paddingBottom: i < match.scenes.length - 1 ? 16 : 0, flex: 1 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text)' }}>
                    {scene.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {match.scenes.length === 0 && !isCompleted && (
        <p style={{ textAlign: 'center', padding: '32px 0', fontSize: 13, color: 'var(--text-subtle)' }}>
          Sin escenas aún. Añade la primera a continuación.
        </p>
      )}

      {/* ── Add scene ─────────────────────────────────────────── */}
      {isGm && !isCompleted && (
        <div
          style={{
            borderRadius: 16,
            padding: '16px 18px',
            marginBottom: 12,
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 12 }}>
            Añadir escena
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              rows={2}
              placeholder="Describe lo que ocurrió en esta escena..."
              value={sceneText}
              onChange={(e) => setSceneText(e.target.value)}
              style={{
                flex: 1, borderRadius: 12, padding: '10px 14px',
                fontSize: 13, color: 'var(--text)',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                resize: 'none', outline: 'none', lineHeight: 1.5,
                fontFamily: 'inherit',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              onClick={() => addSceneMutation.mutate()}
              disabled={!sceneText.trim() || addSceneMutation.isPending}
              style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                color: 'white', border: 'none', cursor: 'pointer',
                opacity: !sceneText.trim() || addSceneMutation.isPending ? 0.4 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Finalize session ──────────────────────────────────── */}
      {isGm && !isCompleted && (
        finalizing ? (
          <div
            style={{
              borderRadius: 16,
              padding: '16px 18px',
              background: 'rgba(16,185,129,0.05)',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#34d399', marginBottom: 12 }}>
              Resolución de la sesión
            </p>
            <textarea
              rows={3}
              placeholder="¿Cómo terminó la sesión?"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              style={{
                width: '100%', borderRadius: 12, padding: '10px 14px',
                fontSize: 13, color: 'var(--text)',
                background: 'var(--surface-2)', border: '1px solid rgba(16,185,129,0.25)',
                resize: 'none', outline: 'none', lineHeight: 1.5,
                marginBottom: 12, boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)')}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => finalizeMutation.mutate()}
                disabled={!resolution.trim() || finalizeMutation.isPending}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'linear-gradient(135deg,#059669,#047857)',
                  color: 'white', border: 'none', borderRadius: 12,
                  padding: '9px 18px', fontSize: 13, fontWeight: 600,
                  cursor: !resolution.trim() || finalizeMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: !resolution.trim() || finalizeMutation.isPending ? 0.5 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                <CheckCircle2 size={13} />
                Finalizar sesión
              </button>
              <button
                onClick={() => setFinalizing(false)}
                style={{
                  display: 'flex', alignItems: 'center',
                  background: 'var(--surface-2)', color: 'var(--text-muted)',
                  border: '1px solid var(--border-bright)', borderRadius: 12,
                  padding: '9px 16px', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setFinalizing(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(16,185,129,0.08)',
              color: '#34d399', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.14)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.08)')}
          >
            <CheckCircle2 size={14} />
            Finalizar sesión
          </button>
        )
      )}
    </div>
  )
}
