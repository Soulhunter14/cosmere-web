import { useState, type CSSProperties } from 'react'
import { Info } from 'lucide-react'
import { resolveCombat } from '../../data/overlays'
import { TalentActivation } from '../../components/TalentActivation'
import type { ActivationType } from '../../components/TalentActivation'
import { CosmereIcon } from '../../components/CosmereIcon'
import { Disclosure, PageHeader, SectionTitle, Spinner, Tabs, TabPanel, type TabItem } from '../../components/ui'
import { useWorld, useWorldConfig, useWorldData } from '../../store/campaignStore'
import { c, font, fs, page, radius } from '../../theme'

type TabId = 'sections' | 'actions' | 'reactions'
const TABS: TabItem<TabId>[] = [
  { id: 'sections', label: 'Reglas' },
  { id: 'actions', label: 'Acciones' },
  { id: 'reactions', label: 'Reacciones' },
]

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const ACCENT = 'var(--rubi)'

function ActionCard({ name, cost, description, headingLevel }: {
  name: string
  cost: ActivationType
  description: string
  headingLevel: 2 | 3
}) {
  return (
    <Disclosure
      headingLevel={headingLevel}
      accent={ACCENT}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* The badge is UI text: Geist, not the serif of the card title */}
          <span style={{ display: 'inline-flex', fontFamily: font.ui }}>
            <TalentActivation type={cost} />
          </span>
          <span>{name}</span>
        </span>
      }
    >
      <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6 }}>{description}</p>
    </Disclosure>
  )
}

function RuleDetails({ details }: { details: { label: string; text: string }[] }) {
  return (
    <dl style={stack(0)}>
      {details.map((d, i) => (
        <div key={d.label} style={{ paddingTop: i === 0 ? 0 : 12, paddingBottom: 12, borderTop: i === 0 ? 'none' : `1px solid ${c.border}` }}>
          <dt style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: fs.base - 1, fontWeight: 650, color: c.text, lineHeight: 1.35, marginBottom: 4 }}>
            <CosmereIcon name="ornamento-rombo" size={8} style={{ color: 'var(--gold-ornament)' }} />
            {d.label}
          </dt>
          <dd style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6, paddingLeft: 16 }}>{d.text}</dd>
        </div>
      ))}
    </dl>
  )
}

export function CombatPage() {
  const [tab, setTab] = useState<TabId>('sections')
  // The rules are Cosmere (data/combatRules.ts); what differs between books is the overlay of the world of the campaign
  const world = useWorld()
  const cfg = useWorldConfig()
  const { data, isPending } = useWorldData()
  const subtitle = `Referencia rápida de reglas de combate ${cfg.nombreDe}`

  // Stormlight never waits (its WorldData is `initialData`); Mistborn's overlay comes with its lazy chunk: wait for it instead of
  // flashing the base rules. If the chunk fails to load, `data` is undefined and the base is shown
  if (isPending) {
    return (
      <div style={page}>
        <PageHeader title="Combate" subtitle={subtitle} />
        <Spinner />
      </div>
    )
  }
  const combat = resolveCombat(world, data?.overlays.combat)

  return (
    <div style={page}>
      <PageHeader title="Combate" subtitle={subtitle} />

      <Tabs tabs={TABS} value={tab} onChange={setTab} ariaLabel="Secciones de Combate" idPrefix="combat" style={{ marginBottom: 20 }} />

      {tab === 'sections' && (
        <TabPanel idPrefix="combat" id="sections" style={stack(10)}>
          {combat.sections.map((s, i) => (
            <div key={s.id} className="rise" style={{ '--i': i } as CSSProperties}>
              <Disclosure title={s.title} summary={s.summary} headingLevel={2} accent={ACCENT}>
                <RuleDetails details={s.details} />
              </Disclosure>
            </div>
          ))}
        </TabPanel>
      )}

      {tab === 'actions' && (
        <TabPanel idPrefix="combat" id="actions" style={stack(28)}>
          <section>
            <SectionTitle>Acciones estándar</SectionTitle>
            <div style={stack(8)}>
              {combat.actions.map((a, i) => (
                <div key={a.name} className="rise" style={{ '--i': i } as CSSProperties}>
                  <ActionCard {...a} headingLevel={3} />
                </div>
              ))}
            </div>
          </section>
          <section>
            <SectionTitle>Acciones gratuitas</SectionTitle>
            <div style={stack(8)}>
              {combat.freeActions.map((a, i) => (
                <div key={a.name} className="rise" style={{ '--i': combat.actions.length + i } as CSSProperties}>
                  <ActionCard {...a} headingLevel={3} />
                </div>
              ))}
            </div>
          </section>
        </TabPanel>
      )}

      {tab === 'reactions' && (
        <TabPanel idPrefix="combat" id="reactions" style={stack(8)}>
          <p
            style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6, marginBottom: 8,
              padding: '14px 16px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`,
            }}
          >
            <Info size={18} aria-hidden style={{ color: c.brand, marginTop: 2 }} />
            <span>
              Las reacciones se activan en respuesta a un detonante específico. Solo puedes usar una reacción por detonante, aunque ciertos talentos pueden otorgarte reacciones adicionales.
            </span>
          </p>
          {combat.reactions.map((a, i) => (
            <div key={a.name} className="rise" style={{ '--i': i } as CSSProperties}>
              <ActionCard {...a} headingLevel={2} />
            </div>
          ))}
        </TabPanel>
      )}
    </div>
  )
}
