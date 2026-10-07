import { useState, type CSSProperties, type ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Target, BookOpen, Sparkles, ShoppingBag, ChevronRight, Users, Coins } from 'lucide-react'
import { CharacterListPage } from '../characters/CharacterListPage'
import { MetasPage } from './MetasPage'
import { TalentosPage } from './TalentosPage'
import { BolsaPage } from './BolsaPage'
import { EmptyState, PageHeader, Spinner, TabPanel, Tabs, type TabItem } from '../../components/ui'
import { useCampaignStore, useEra, useWorldConfig } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import { charactersApi } from '../../api/characters'
import { CharacterIdentityPills } from '../../components/CharacterIdentityPills'
import { CosmereIcon } from '../../components/CosmereIcon'
import { CharacterHero } from '../../components/CharacterHero'
import { heroPill, onGem, onGemSoft } from '../../lib/hero'
import { characterGradient } from '../../lib/avatar'
import { cosmereImage } from '../../lib/cosmereAssets'
import { monedaImagen } from '../../lib/moneda'
import { buttonReset, c, card, eyebrow, font, fs, page, radius, shadow, titleText, tone, type Tone } from '../../theme'

/* Text on the CharacterHero / character gradient (lib/avatar + CharacterHero: ≥ 7:1 on every palette) */
const HERO_TEXT = onGem
const HERO_TEXT_SOFT = onGemSoft

const GM_TABS = [
  { id: 'characters', label: 'Personajes' },
  { id: 'metas',     label: 'Metas' },
  { id: 'talentos',  label: 'Talentos' },
  { id: 'bolsa',     label: 'Bolsa' },
] as const

type GmTab = typeof GM_TABS[number]['id']

const GM_TAB_ICONS: Record<GmTab, typeof Users> = {
  characters: Users,
  metas: Target,
  talentos: Sparkles,
  bolsa: ShoppingBag,
}

const TABS_ID = 'personajes'

// ─── GM view: full character list + metas tabs ─────────────────────────────

function GmPersonajesView() {
  const [activeTab, setActiveTab] = useState<GmTab>('characters')

  const tabs: TabItem<GmTab>[] = GM_TABS.map((tab) => {
    const Icon = GM_TAB_ICONS[tab.id]
    return {
      id: tab.id,
      label: tab.label,
      // Icons from tablet up; on phones the four labels need the whole width
      icon: <span aria-hidden className="hide-mobile" style={{ lineHeight: 0 }}><Icon size={15} /></span>,
    }
  })

  return (
    <div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 16px 0' }}>
        <Tabs<GmTab>
          tabs={tabs}
          value={activeTab}
          onChange={setActiveTab}
          ariaLabel="Secciones de personajes"
          idPrefix={TABS_ID}
          size="sm"
          stretch
        />
      </div>
      <TabPanel idPrefix={TABS_ID} id={activeTab}>
        {activeTab === 'characters' && <CharacterListPage />}
        {activeTab === 'metas'     && <MetasPage />}
        {activeTab === 'talentos'  && <TalentosPage />}
        {activeTab === 'bolsa'     && <BolsaPage />}
      </TabPanel>
    </div>
  )
}

// ─── Player view: personal landing with direct access ──────────────────────

function ActionCard({
  title,
  subtitle,
  tile,
  onClick,
  index,
}: {
  title: string
  subtitle: string
  tile: ReactNode
  onClick: () => void
  index: number
}) {
  return (
    <li className="rise" style={{ '--i': index + 1, display: 'flex' } as CSSProperties}>
      <button
        type="button"
        onClick={onClick}
        className="ui-card ui-card--interactive"
        style={{
          ...buttonReset,
          ...card,
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 14px 16px 16px',
          minHeight: 84,
        }}
      >
        {tile}
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: font.display, fontSize: fs.lg + 1, fontWeight: 600, lineHeight: 1.2, color: c.text }}>{title}</span>
          <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.4 }}>{subtitle}</span>
        </span>
        <ChevronRight size={18} aria-hidden style={{ color: c.subtle }} />
      </button>
    </li>
  )
}

const tileBase: CSSProperties = {
  width: 48, height: 48, flexShrink: 0, borderRadius: radius.md,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

function ToneTile({ t, children }: { t: Tone; children: ReactNode }) {
  return (
    <span aria-hidden style={{ ...tileBase, background: t.bg, border: `1px solid ${t.border}`, color: t.fg }}>
      {children}
    </span>
  )
}

function PlayerPersonajesPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const cfg = useWorldConfig()
  const era = useEra()

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters', cId],
    queryFn: () => charactersApi.getAll(cId),
  })

  if (isLoading) return <Spinner />

  const character = characters.find((c) => c.ownerId === user?.id) ?? null

  if (!character) {
    return (
      <div style={{ ...page, paddingBottom: 48 }}>
        <PageHeader title="Mi personaje" />
        <EmptyState
          icon={<Users size={22} aria-hidden />}
          title="Sin personaje asignado"
          description="El GM aún no te ha asignado un personaje."
        />
      </div>
    )
  }

  const activeMetas = character.metas?.filter((m) => m.estado === 'activa').length ?? 0
  const sphere = cosmereImage('esfera-broam-esmeralda')
  // Nacidos de la bruma: the Bolsa tile carries the official illustration of the money of the era instead of the sphere
  const dinero = monedaImagen(cfg.moneda, era)

  const actions: { key: string; title: string; subtitle: string; to: string; tile: ReactNode }[] = [
    {
      key: 'ficha',
      title: 'Mi ficha',
      subtitle: 'Atributos, habilidades, equipo y más',
      to: `/campaigns/${cId}/characters/${character.id}`,
      tile: (
        <span aria-hidden style={{ ...tileBase, background: characterGradient(character.id), boxShadow: shadow[1], color: HERO_TEXT }}>
          <BookOpen size={20} />
        </span>
      ),
    },
    {
      key: 'metas',
      title: 'Metas',
      subtitle: activeMetas > 0 ? `${activeMetas} meta${activeMetas !== 1 ? 's' : ''} activa${activeMetas !== 1 ? 's' : ''}` : 'Objetivos de tu personaje',
      to: `/campaigns/${cId}/personajes/metas/${character.id}`,
      tile: <ToneTile t={tone.brand}><Target size={20} /></ToneTile>,
    },
    {
      key: 'talentos',
      title: 'Talentos',
      subtitle: 'Habilidades especiales de tu personaje',
      to: `/campaigns/${cId}/personajes/talentos/${character.id}`,
      tile: <ToneTile t={tone.topacio}><Sparkles size={20} /></ToneTile>,
    },
    {
      key: 'bolsa',
      title: 'Bolsa',
      subtitle: `Inventario, ${cfg.moneda.nombre.toLowerCase()} y equipo`,
      to: `/campaigns/${cId}/personajes/bolsa/${character.id}`,
      tile: (
        <ToneTile t={tone.esmeralda}>
          {cfg.features.arquillas
            ? (dinero ? <img src={dinero} alt="" width={30} height={30} style={{ width: 30, height: 30, objectFit: 'contain' }} /> : <Coins size={20} />)
            : (sphere ? <img src={sphere} alt="" width={30} height={30} style={{ width: 30, height: 30, objectFit: 'contain' }} /> : <ShoppingBag size={20} />)}
        </ToneTile>
      ),
    },
  ]

  return (
    <div style={{ ...page, paddingBottom: 48 }}>
      {/* Character identity block */}
      <CharacterHero
        characterId={character.id}
        padding="22px 20px"
        style={{
          borderRadius: radius.xl,
          borderBottom: 'none',
          boxShadow: `0 0 0 1px var(--border-bright), ${shadow[2]}`,
          marginBottom: 24,
        }}
      >
        <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Initial inside the official gold medallion */}
          <span
            aria-hidden
            style={{
              position: 'relative', width: 68, height: 68, flexShrink: 0, borderRadius: '50%',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: heroPill.background,
            }}
          >
            <CosmereIcon name="ornamento-medallon" size={68} square style={{ position: 'absolute', inset: 0, color: 'var(--gold-ornament)' }} />
            <span style={{ ...titleText, fontSize: fs['2xl'], lineHeight: 1, color: HERO_TEXT }}>
              {character.name.charAt(0).toUpperCase() || '?'}
            </span>
          </span>

          <div style={{ minWidth: 0 }}>
            <p style={{ ...eyebrow, color: HERO_TEXT_SOFT, marginBottom: 4 }}>Mi personaje</p>
            <h1 style={{ ...titleText, fontSize: fs['2xl'], color: HERO_TEXT, marginBottom: 10, overflowWrap: 'anywhere' }}>
              {character.name}
            </h1>
            <CharacterIdentityPills
              character={character}
              variant="hero"
              insetIcon={false}
              leading={<span style={{ ...heroPill, fontVariantNumeric: 'tabular-nums' }}>Nv. {character.level}</span>}
            />
          </div>
        </div>
      </CharacterHero>

      {/* Action cards */}
      <ul
        role="list"
        style={{
          listStyle: 'none',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 12,
        }}
      >
        {actions.map((a, i) => (
          <ActionCard key={a.key} index={i} title={a.title} subtitle={a.subtitle} tile={a.tile} onClick={() => navigate(a.to)} />
        ))}
      </ul>
    </div>
  )
}

// ─── Root export ───────────────────────────────────────────────────────────

export function PersonajesPage() {
  const { isGm } = useCampaignStore()

  if (!isGm) return <PlayerPersonajesPage />
  return <GmPersonajesView />
}
