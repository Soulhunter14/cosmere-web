import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { POTENCIAS, POTENCIAS_REGLAS } from '../../data/potencias'
import type { Potencia, Talento } from '../../data/potencias'
import { TalentActivation } from '../../components/TalentActivation'
import { SurgeIcon } from '../../components/GameIcons'
import { CosmereIcon } from '../../components/CosmereIcon'
import { Disclosure, PageHeader, SectionTitle, Tabs, TabPanel, type TabItem } from '../../components/ui'
import { c, eyebrow, font, fs, numeral, page, pill, radius, shadow, tone, type ToneName } from '../../theme'

type TabId = 'reglas' | 'potencias'
const TABS: TabItem<TabId>[] = [
  { id: 'reglas', label: 'Reglas' },
  { id: 'potencias', label: 'Potencias' },
]

/** Attribute → gem tone (was a page-local hex palette; same hues, now theme-aware tokens) */
const ATRIBUTO_TONE: Record<string, ToneName> = {
  Velocidad: 'zafiro',
  Presencia: 'amatista',
  Voluntad: 'rubi',
  Intelecto: 'heliodoro',
  Discernimiento: 'esmeralda',
  Fuerza: 'topacio',
}

const ESCALADO = [
  { g: '1', d: 'd4', t: 'Pequeño (0,75 m)' },
  { g: '2', d: 'd6', t: 'Mediano (1,5 m)' },
  { g: '3', d: 'd8', t: 'Grande (3 m)' },
  { g: '4', d: 'd10', t: 'Enorme (4,5 m)' },
  { g: '5', d: 'd12', t: 'Gargantuesco (6 m)' },
]

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })

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

function Note({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        padding: '14px 16px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`,
        fontSize: fs.sm + 1, color: c.muted, lineHeight: 1.55,
      }}
    >
      <span aria-hidden style={{ color: c.subtle, display: 'flex', marginTop: 1 }}>
        <SurgeIcon surge="transportacion" size={22} />
      </span>
      <span>{children}</span>
    </p>
  )
}

// ── Talent row: header button + sibling panel ──────────────────
function TalentoRow({ talento }: { talento: Talento }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div
      style={{
        borderRadius: radius.md,
        background: c.s2,
        border: `1px solid ${open ? c.borderBright : c.border}`,
        transition: 'border-color var(--dur-2)',
      }}
    >
      <h4 style={{ margin: 0, fontFamily: font.ui, fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 0 }}>
        <button
          type="button"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen(!open)}
          className="ui-row"
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, minHeight: 48,
            padding: '10px 12px', background: 'none', border: 'none', borderRadius: radius.md,
            cursor: 'pointer', textAlign: 'left', color: c.text,
          }}
        >
          <TalentActivation type={talento.cost} compact />
          <span style={{ flex: 1, minWidth: 0, fontSize: fs.base - 1, fontWeight: 650, lineHeight: 1.3 }}>{talento.name}</span>
          <ChevronDown
            size={16}
            aria-hidden
            style={{ color: c.subtle, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-2) var(--ease-out)' }}
          />
        </button>
      </h4>
      {open && (
        <div id={`${id}-panel`} className="fade-in" style={{ padding: '0 12px 12px' }}>
          <div style={{ ...stack(6), paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
            {talento.prereq && (
              <p style={{ fontSize: fs.sm, color: c.subtle, fontStyle: 'italic' }}>
                Prerrequisito: {talento.prereq}
              </p>
            )}
            <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6 }}>
              {talento.description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Potencia card: official surge glyph + expandable talents ──
function PotenciaCard({ potencia }: { potencia: Potencia }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const attr = tone[ATRIBUTO_TONE[potencia.atributo] ?? 'brand']

  return (
    <article
      className="ui-card"
      style={{
        background: c.s1,
        border: `1px solid ${open ? c.borderBright : c.border}`,
        borderRadius: radius.lg,
        boxShadow: open ? 'inset 3px 0 0 var(--brand)' : shadow[1],
        overflow: 'hidden',
      }}
    >
      <h2 style={{ margin: 0, fontFamily: font.ui, fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 0 }}>
        <button
          type="button"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen(!open)}
          className="ui-row"
          style={{
            width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 16px 12px',
            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: c.text,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 56, height: 56, borderRadius: radius.md, flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', color: c.brand,
            }}
          >
            <SurgeIcon surge={potencia.id} size={34} />
          </span>

          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: font.display, fontSize: fs.lg + 2, fontWeight: 600, lineHeight: 1.2 }}>{potencia.name}</span>
            <span style={{ fontSize: fs.sm, color: c.subtle, lineHeight: 1.4 }}>{potencia.ordenes.join(' · ')}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              <span style={{ ...pill(attr), fontSize: fs.eyebrow, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {potencia.atributo}
              </span>
              <TalentActivation type={potencia.costoBase} compact />
            </span>
          </span>

          <ChevronDown
            size={18}
            aria-hidden
            style={{ color: c.subtle, marginTop: 4, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-2) var(--ease-out)' }}
          />
        </button>
      </h2>

      <p style={{ padding: '0 16px 16px', fontSize: fs.base - 1, color: c.muted, lineHeight: 1.55 }}>{potencia.descripcion}</p>

      {open && (
        <div
          id={`${id}-panel`}
          role="region"
          aria-labelledby={`${id}-btn`}
          className="fade-in"
          style={{ padding: '14px 16px 16px', borderTop: `1px solid ${c.border}` }}
        >
          <h3 style={{ ...eyebrow, fontFamily: font.ui, marginBottom: 10 }}>Talentos</h3>
          <div style={stack(6)}>
            {potencia.talentos.map((t) => (
              <TalentoRow key={t.name} talento={t} />
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

const th: CSSProperties = {
  ...eyebrow, textAlign: 'left', padding: '10px 14px', background: c.s2, borderBottom: `1px solid ${c.border}`,
}
const td = (first: boolean): CSSProperties => ({
  padding: '12px 14px', borderTop: first ? 'none' : `1px solid ${c.border}`, fontSize: fs.sm + 1, color: c.muted, verticalAlign: 'middle',
})

export function PotenciasPage() {
  const [tab, setTab] = useState<TabId>('reglas')

  return (
    <div style={page}>
      <PageHeader
        title="Potencias"
        subtitle="Las diez potencias Radiantes: reglas de infusión, escalado y talentos"
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} ariaLabel="Secciones de Potencias" idPrefix="potencias" style={{ marginBottom: 20 }} />

      {tab === 'reglas' && (
        <TabPanel idPrefix="potencias" id="reglas" style={stack(28)}>
          <div style={stack(10)}>
            {POTENCIAS_REGLAS.map((r, i) => (
              <div key={r.id} className="rise" style={{ '--i': i } as CSSProperties}>
                <Disclosure title={r.title} summary={r.summary} headingLevel={2} accent="var(--brand)">
                  <RuleDetails details={r.details} />
                </Disclosure>
              </div>
            ))}
          </div>

          {/* Scaling table */}
          <section>
            <SectionTitle id="tabla-escalado-potencias">Tabla de escalado de potencias</SectionTitle>
            <div style={{ borderRadius: radius.md, border: `1px solid ${c.border}`, overflow: 'hidden', background: c.s1, boxShadow: shadow[1] }}>
              <table aria-labelledby="tabla-escalado-potencias" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th scope="col" style={{ ...th, width: 88 }}>Grados</th>
                    <th scope="col" style={{ ...th, width: 80 }}>Dado</th>
                    <th scope="col" style={th}>Tamaño máximo</th>
                  </tr>
                </thead>
                <tbody>
                  {ESCALADO.map((row, i) => (
                    <tr key={row.g}>
                      <th scope="row" style={{ ...td(i === 0), textAlign: 'left' }}>
                        <span style={{ ...numeral, fontSize: fs.lg, color: c.brandLight }}>{row.g}</span>
                      </th>
                      <td style={{ ...td(i === 0), fontFamily: font.mono, fontSize: fs.base, fontWeight: 600, color: c.text }}>{row.d}</td>
                      <td style={td(i === 0)}>{row.t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Note about Transportación */}
          <Note>
            La décima potencia, <strong style={{ color: c.text, fontWeight: 650 }}>Transportación</strong> (Intelecto) — usada por Nominadores de lo Otro y Escultores de Voluntad — no está incluida en esta versión. Consúltala en el libro a partir de la página 240.
          </Note>
        </TabPanel>
      )}

      {tab === 'potencias' && (
        <TabPanel idPrefix="potencias" id="potencias" style={stack(10)}>
          {POTENCIAS.map((p, i) => (
            <div key={p.id} className="rise" style={{ '--i': i } as CSSProperties}>
              <PotenciaCard potencia={p} />
            </div>
          ))}
          <Note>
            <strong style={{ color: c.text, fontWeight: 650 }}>Transportación</strong> (Intelecto) — Nominador de lo Otro, Escultor de Voluntad — pendiente de añadir (pág. 240+).
          </Note>
        </TabPanel>
      )}
    </div>
  )
}
