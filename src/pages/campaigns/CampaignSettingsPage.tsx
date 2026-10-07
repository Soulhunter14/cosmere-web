import { useState, type CSSProperties } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Copy, RefreshCw, Check, Link2, Link2Off, LogOut } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { campaignsApi } from '../../api/campaigns'
import { useCampaignStore } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import { Avatar, Badge, Button, Card, ErrorMessage, PageHeader, SectionTitle, Sheet, Spinner, StatTile, Switch } from '../../components/ui'
import { CosmereIcon } from '../../components/CosmereIcon'
import { ThemeSwitcher } from '../../components/ThemeSwitcher'
import { getWorld } from '../../worlds'
import type { Era } from '../../types'
import { c, eyebrow, font, fs, page, radius, titleText, tone } from '../../theme'

/* The name of the setting or the era inside a StatTile: a heading-sized serif line instead of the big stat numeral */
const tileValue: CSSProperties = { fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, lineHeight: 1.2, letterSpacing: 0, fontVariantNumeric: 'normal' }

/**
 * Setting of the campaign, read only: world and era are fixed when the campaign is created (spec §3 b, c), so there is
 * nothing to edit here. Names, emblem and era labels come from the world's configuration (P8). A world without eras
 * (Stormlight) has no era tile.
 */
function AmbientacionSection({ world, era, index }: { world: string; era: Era | null; index: number }) {
  const cfg = getWorld(world)
  const eraDef = era ? cfg.eras?.find((e) => e.id === era) : undefined
  return (
    <section aria-labelledby="settings-world" className="rise" style={{ '--i': index } as CSSProperties}>
      <SectionTitle id="settings-world">Ambientación</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <StatTile
          label="Mundo"
          icon={<CosmereIcon name={cfg.emblema} size={14} />}
          value={<span style={tileValue}>{cfg.nombre}</span>}
          sub={`Ambientada en ${cfg.planeta}`}
        />
        {cfg.eras && (
          <StatTile
            label="Era"
            value={<span style={{ ...tileValue, color: eraDef?.tone.fg }}>{eraDef?.label ?? '—'}</span>}
            sub={eraDef?.aviso}
            style={eraDef ? { border: `1px solid ${eraDef.tone.border}` } : undefined}
          />
        )}
      </div>
      <p style={{ fontSize: fs.xs, color: c.subtle, marginTop: 10, lineHeight: 1.45 }}>
        La ambientación y la era se fijan al crear la campaña y no se pueden cambiar.
      </p>
    </section>
  )
}

export function CampaignSettingsPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const id = Number(campaignId)
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { isGm } = useCampaignStore()
  const { user, logout } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [confirmRegenerate, setConfirmRegenerate] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const { data: campaign, isLoading, error } = useQuery({
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

  const members = campaign?.members ?? []

  return (
    <div style={page}>
      <PageHeader title="Ajustes" subtitle={campaign?.name} />

      {error && <ErrorMessage message="No se pudo cargar la campaña." style={{ marginBottom: 24 }} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* ── Invite code (GM only) ─────────────────────────────── */}
        {isGm && campaign?.inviteCode && (
          <section aria-labelledby="settings-invite" className="rise">
            <SectionTitle id="settings-invite">Código de invitación</SectionTitle>
            <Card padding={0} style={{ overflow: 'hidden' }}>
              {/* Code display */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                  padding: '18px 16px 18px 20px',
                  background: 'linear-gradient(160deg, var(--surface-2), var(--surface-1))',
                }}
              >
                <code
                  style={{
                    fontFamily: font.mono, fontSize: fs['2xl'], fontWeight: 700,
                    letterSpacing: '0.22em', color: c.brandLight, lineHeight: 1.1,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {campaign.inviteCode}
                </code>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Button
                    variant="secondary"
                    onClick={copyCode}
                    icon={copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
                    /* Full `border` shorthand: overriding only borderColor would wipe the variant's colour when it reverts */
                    style={copied ? { background: tone.esmeralda.bg, border: `1px solid ${tone.esmeralda.border}`, color: tone.esmeralda.fg } : undefined}
                  >
                    {copied ? 'Copiado' : 'Copiar'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setConfirmRegenerate(true)}
                    disabled={regenerateMutation.isPending}
                    aria-haspopup="dialog"
                    icon={<RefreshCw size={15} aria-hidden style={{ animation: regenerateMutation.isPending ? 'spin 1s linear infinite' : 'none' }} />}
                  >
                    Regenerar
                  </Button>
                </div>
                <span role="status" className="sr-only">{copied ? 'Copiado' : ''}</span>
              </div>

              {/* Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 14px 20px', borderTop: `1px solid ${c.border}` }}>
                <span
                  aria-hidden
                  style={{
                    width: 36, height: 36, flexShrink: 0, borderRadius: radius.sm,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: campaign.inviteActive ? tone.brand.bg : c.s2,
                    border: `1px solid ${campaign.inviteActive ? tone.brand.border : c.border}`,
                    color: campaign.inviteActive ? c.brandLight : c.subtle,
                  }}
                >
                  {campaign.inviteActive ? <Link2 size={17} /> : <Link2Off size={17} />}
                </span>
                <label htmlFor="settings-invite-switch" style={{ flex: 1, minWidth: 0, cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ display: 'block', fontSize: fs.base, fontWeight: 650, color: campaign.inviteActive ? c.text : c.muted }}>
                    Invitaciones {campaign.inviteActive ? 'activas' : 'desactivadas'}
                  </span>
                  <span style={{ display: 'block', fontSize: fs.sm, color: c.subtle, marginTop: 2 }}>
                    {campaign.inviteActive ? 'Cualquiera con el código puede unirse' : 'Nadie puede unirse con el código'}
                  </span>
                </label>
                <Switch
                  id="settings-invite-switch"
                  label="Invitaciones"
                  checked={campaign.inviteActive}
                  disabled={toggleInviteMutation.isPending}
                  onChange={(next) => toggleInviteMutation.mutate(next)}
                />
              </div>
            </Card>
          </section>
        )}

        {/* ── Setting (read only) ───────────────────────────────── */}
        {campaign && <AmbientacionSection world={campaign.world} era={campaign.era} index={1} />}

        {/* ── Account ──────────────────────────────────────────── */}
        <section aria-labelledby="settings-account" className="rise" style={{ '--i': 2 } as CSSProperties}>
          <SectionTitle id="settings-account">Tu cuenta</SectionTitle>
          <Card padding={0}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '16px 16px 16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <Avatar name={user?.displayName} size={44} tone={isGm ? 'rubi' : 'brand'} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ ...titleText, fontSize: fs.lg, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.displayName}
                  </p>
                  <p style={{ fontSize: fs.sm, color: c.subtle, marginTop: 2 }}>@{user?.username}</p>
                </div>
              </div>
              <Button variant="danger" size="sm" icon={<LogOut size={15} aria-hidden />} onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>
            <div style={{ padding: '14px 20px 18px', borderTop: `1px solid ${c.border}` }}>
              <p style={{ ...eyebrow, marginBottom: 8 }}>Apariencia</p>
              <ThemeSwitcher />
            </div>
          </Card>
        </section>

        {/* ── Members ───────────────────────────────────────────── */}
        <section aria-labelledby="settings-members" className="rise" style={{ '--i': 3 } as CSSProperties}>
          <SectionTitle id="settings-members">
            Miembros{' '}
            <span style={{ fontFamily: font.ui, fontVariantCaps: 'normal', fontSize: fs.sm, fontWeight: 600, letterSpacing: 0, color: c.subtle }}>
              ({campaign?.members.length ?? 0})
            </span>
          </SectionTitle>
          <Card padding={0}>
            <ul role="list" style={{ listStyle: 'none' }}>
              {members.map((m, i) => {
                const isGmMember = m.role === 'gm'
                return (
                  <li
                    key={m.userId}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      minHeight: 60, padding: '10px 16px 10px 20px',
                      borderTop: i === 0 ? 'none' : `1px solid ${c.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <Avatar name={m.displayName} size={36} tone={isGmMember ? 'rubi' : 'brand'} />
                      <span style={{ fontSize: fs.base, fontWeight: 600, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.displayName}
                      </span>
                    </div>
                    <Badge tone={isGmMember ? 'rubi' : 'brand'} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
                      {isGmMember ? 'Director' : 'Jugador'}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          </Card>
        </section>
      </div>

      {/* Regenerating invalidates the current code: ask first */}
      <Sheet
        open={confirmRegenerate}
        onClose={() => setConfirmRegenerate(false)}
        role="alertdialog"
        maxWidth={420}
        title="¿Regenerar el código?"
        description="El código actual dejará de funcionar y tendrás que compartir el nuevo."
        footer={
          <>
            <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={() => setConfirmRegenerate(false)} data-autofocus>
              Cancelar
            </Button>
            <Button
              size="lg"
              style={{ flex: 1 }}
              icon={<RefreshCw size={16} aria-hidden />}
              onClick={() => { setConfirmRegenerate(false); regenerateMutation.mutate() }}
            >
              Regenerar
            </Button>
          </>
        }
      />
    </div>
  )
}
