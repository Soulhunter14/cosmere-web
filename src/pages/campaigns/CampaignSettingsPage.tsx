import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Copy, RefreshCw, Users, Check, Link2, Link2Off, LogOut } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { campaignsApi } from '../../api/campaigns'
import { useCampaignStore } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../../components/ui'

export function CampaignSettingsPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const id = Number(campaignId)
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { isGm } = useCampaignStore()
  const { user, logout } = useAuthStore()
  const [copied, setCopied] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.getById(id),
  })

  const regenerateMutation = useMutation({
    mutationFn: () => campaignsApi.regenerateCode(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaign', id] }),
  })

  const toggleInviteMutation = useMutation({
    mutationFn: (active: boolean) => campaignsApi.updateInvite(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaign', id] }),
  })

  const copyCode = () => {
    if (campaign?.inviteCode) {
      navigator.clipboard.writeText(campaign.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) return <Spinner />

  return (
    <div style={{ padding: '24px 20px', maxWidth: 680, margin: '0 auto' }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em',
          color: 'var(--text)', marginBottom: 4, lineHeight: 1.2,
        }}>
          Ajustes
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {campaign?.name}
        </p>
      </div>

      {/* ── Invite code (GM only) ─────────────────────────────── */}
      {isGm && campaign?.inviteCode && (
        <div
          style={{
            borderRadius: 18,
            padding: '20px',
            marginBottom: 16,
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(180,190,254,0.1)', border: '1px solid rgba(180,190,254,0.15)',
            }}>
              <Users size={14} style={{ color: 'var(--brand-light)' }} />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
              Código de invitación
            </h3>
          </div>

          {/* Code display */}
          <div
            style={{
              borderRadius: 14,
              padding: '16px 18px',
              marginBottom: 14,
              background: 'var(--surface-2)',
              border: '1px solid var(--border-bright)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}
          >
            <code style={{
              fontSize: 26, fontFamily: 'monospace', fontWeight: 800,
              letterSpacing: '0.22em', color: 'var(--brand-light)',
            }}>
              {campaign.inviteCode}
            </code>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={copyCode}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: copied ? 'rgba(16,185,129,0.1)' : 'var(--surface-1)',
                  border: `1px solid ${copied ? 'rgba(16,185,129,0.25)' : 'var(--border-bright)'}`,
                  color: copied ? '#34d399' : 'var(--text-muted)',
                  borderRadius: 10, padding: '6px 12px',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button
                onClick={() => regenerateMutation.mutate()}
                disabled={regenerateMutation.isPending}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'transparent',
                  border: '1px solid var(--border-bright)',
                  color: 'var(--text-subtle)',
                  borderRadius: 10, padding: '6px 12px',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
              >
                <RefreshCw size={12} style={{ animation: regenerateMutation.isPending ? 'spin 1s linear infinite' : 'none' }} />
                Regenerar
              </button>
            </div>
          </div>

          {/* Toggle */}
          <label
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={campaign.inviteActive}
                onChange={(e) => toggleInviteMutation.mutate(e.target.checked)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              <div
                style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: campaign.inviteActive ? 'var(--brand)' : 'var(--surface-3)',
                  border: '1px solid var(--border-bright)',
                  transition: 'background 0.2s',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute', top: 2, width: 16, height: 16,
                    borderRadius: '50%', background: 'white',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    transition: 'left 0.2s',
                    left: campaign.inviteActive ? '20px' : '2px',
                  }}
                />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {campaign.inviteActive
                  ? <Link2 size={13} style={{ color: 'var(--brand-light)' }} />
                  : <Link2Off size={13} style={{ color: 'var(--text-subtle)' }} />}
                <span style={{ fontSize: 13, fontWeight: 600, color: campaign.inviteActive ? 'var(--text)' : 'var(--text-muted)' }}>
                  Invitaciones {campaign.inviteActive ? 'activas' : 'desactivadas'}
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 1 }}>
                {campaign.inviteActive ? 'Cualquiera con el código puede unirse' : 'Nadie puede unirse con el código'}
              </p>
            </div>
          </label>
        </div>
      )}

      {/* ── Account ──────────────────────────────────────────── */}
      <div
        style={{
          borderRadius: 18,
          padding: '16px 20px',
          marginBottom: 16,
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white',
            background: 'linear-gradient(135deg,#7c3aed,#6366f1)',
          }}>
            {user?.displayName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user?.displayName}</p>
            <p style={{ fontSize: 11, color: 'var(--text-subtle)' }}>@{user?.username}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
            color: '#fb7185', borderRadius: 12, padding: '7px 14px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.14)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.08)')}
        >
          <LogOut size={13} />
          Cerrar sesión
        </button>
      </div>

      {/* ── Members ───────────────────────────────────────────── */}
      <div
        style={{
          borderRadius: 18,
          padding: '20px',
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(180,190,254,0.1)', border: '1px solid rgba(180,190,254,0.15)',
          }}>
            <Users size={14} style={{ color: 'var(--brand-light)' }} />
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            Miembros
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-subtle)', marginLeft: 6 }}>
              ({campaign?.members.length ?? 0})
            </span>
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {campaign?.members.map((m) => {
            const isGmMember = m.role === 'gm'
            return (
              <div
                key={m.userId}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 12,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0,
                    background: isGmMember
                      ? 'linear-gradient(135deg,#d97706,#92400e)'
                      : 'linear-gradient(135deg,#7c3aed,#6366f1)',
                  }}>
                    {m.displayName[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                    {m.displayName}
                  </span>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                  padding: '3px 9px', borderRadius: 20,
                  background: isGmMember ? 'rgba(245,158,11,0.1)' : 'rgba(124,58,237,0.1)',
                  border: isGmMember ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(124,58,237,0.2)',
                  color: isGmMember ? '#fbbf24' : 'var(--brand-light)',
                }}>
                  {isGmMember ? 'GM' : 'Jugador'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
