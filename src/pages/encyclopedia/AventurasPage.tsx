import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Info, Shield, ShieldOff } from 'lucide-react'
import type { AventuraSection, Estado, ActividadReposo, TipoDano } from '../../data/aventuras'
import { resolveAventuras } from '../../data/overlays'
import { CosmereIcon } from '../../components/CosmereIcon'
import { Disclosure, PageHeader, SectionTitle, Spinner, Tabs, TabPanel, type TabItem } from '../../components/ui'
import { useWorld, useWorldData } from '../../store/campaignStore'
import { c, eyebrow, font, fs, numeral, page, pill, radius, shadow, tone, type Tone } from '../../theme'

type TabId = 'escenas' | 'reposo' | 'sucesos' | 'estados' | 'dano'
const TABS: TabItem<TabId>[] = [
  { id: 'escenas', label: 'Escenas' },
  { id: 'reposo', label: 'Reposo' },
  { id: 'sucesos', label: 'Sucesos' },
  { id: 'estados', label: 'Estados' },
  { id: 'dano', label: 'Daño' },
]

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const ACCENT = 'var(--esmeralda)'
const rise = (i: number) => ({ className: 'rise', style: { '--i': i } as CSSProperties })

/** Injury severity (DURACION_LESIONES[].tipo) → gem tone. The tipo is also shown as text. */
const SEVERITY_TONE: Record<string, Tone> = {
  muerte: tone.rubi,
  permanente: tone.heliodoro,
  grave: tone.topacio,
  leve: tone.amatista,
}

// ── Shared bits ───────────────────────────────────────────────
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

function SectionCard({ section, headingLevel }: { section: AventuraSection; headingLevel: 2 | 3 }) {
  return (
    <Disclosure title={section.title} summary={section.summary} headingLevel={headingLevel} accent={ACCENT}>
      <RuleDetails details={section.details} />
    </Disclosure>
  )
}

function SectionList({ sections, headingLevel }: { sections: AventuraSection[]; headingLevel: 2 | 3 }) {
  return (
    <div style={stack(10)}>
      {sections.map((s, i) => (
        <div key={s.id} {...rise(i)}>
          <SectionCard section={s} headingLevel={headingLevel} />
        </div>
      ))}
    </div>
  )
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6,
        padding: '14px 16px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`,
      }}
    >
      <Info size={18} aria-hidden style={{ color: c.brand, marginTop: 2 }} />
      <span>{children}</span>
    </p>
  )
}

/** Horizontal scroller for the tab strip: fades the edge that still has hidden tabs. */
function TabScroller({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: false, end: false })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      setEdges({ start: el.scrollLeft > 2, end: el.scrollLeft < max - 2 })
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])
  const mask = `linear-gradient(90deg, ${edges.start ? 'transparent' : 'var(--bg)'} 0, var(--bg) 28px, var(--bg) calc(100% - 28px), ${edges.end ? 'transparent' : 'var(--bg)'} 100%)`
  return (
    <div
      ref={ref}
      style={{
        overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -16px 20px', padding: '2px 16px',
        WebkitMaskImage: mask, maskImage: mask,
      }}
    >
      {children}
    </div>
  )
}

// ── Estados / actividades / daño ──────────────────────────────
function EstadoCard({ estado }: { estado: Estado }) {
  return (
    <Disclosure title={estado.name} summary={estado.summary} headingLevel={2} accent={ACCENT}>
      <div style={stack(10)}>
        <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6 }}>{estado.details}</p>
        {estado.special && (
          <p
            style={{
              fontSize: fs.sm + 1, color: c.brandLight, lineHeight: 1.55, padding: '10px 14px', borderRadius: radius.sm,
              background: 'var(--brand-bg)', border: '1px solid var(--brand-border)',
            }}
          >
            {estado.special}
          </p>
        )}
      </div>
    </Disclosure>
  )
}

function ActividadCard({ actividad }: { actividad: ActividadReposo }) {
  const meta: CSSProperties = { padding: '8px 12px', borderRadius: radius.sm, background: c.s2, border: `1px solid ${c.border}` }
  return (
    <Disclosure title={actividad.name} headingLevel={3} accent={ACCENT}>
      <div style={stack(12)}>
        <dl style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={meta}>
            <dt style={{ ...eyebrow, marginBottom: 2 }}>Duración</dt>
            <dd style={{ fontSize: fs.sm + 1, color: c.text, fontWeight: 550 }}>{actividad.duration}</dd>
          </div>
          {actividad.cost !== '—' && (
            <div style={meta}>
              <dt style={{ ...eyebrow, marginBottom: 2 }}>Coste</dt>
              <dd style={{ fontSize: fs.sm + 1, color: c.text, fontWeight: 550 }}>{actividad.cost}</dd>
            </div>
          )}
        </dl>
        <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6 }}>{actividad.description}</p>
      </div>
    </Disclosure>
  )
}

function DamageTypeCard({ tipo }: { tipo: TipoDano }) {
  const t = tipo.reducedByDesvio ? tone.heliodoro : tone.rubi
  const Icon = tipo.reducedByDesvio ? Shield : ShieldOff

  return (
    <article
      style={{
        ...stack(8), height: '100%', padding: '14px 16px', borderRadius: radius.md,
        background: c.s1, border: `1px solid ${c.border}`, boxShadow: shadow[1],
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, color: c.text, lineHeight: 1.2 }}>{tipo.name}</h3>
        <span style={pill(t)}>
          <Icon size={12} aria-hidden />
          {tipo.reducedByDesvio ? 'desvío' : 'no desvío'}
        </span>
      </div>
      <p style={{ fontSize: fs.sm + 1, color: c.muted, lineHeight: 1.55 }}>{tipo.description}</p>
    </article>
  )
}

// ── Tables ────────────────────────────────────────────────────
const tableWrap: CSSProperties = {
  borderRadius: radius.md, border: `1px solid ${c.border}`, overflow: 'hidden', background: c.s1, boxShadow: shadow[1],
}
const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }
const th: CSSProperties = {
  ...eyebrow, textAlign: 'left', padding: '10px 14px', background: c.s2, borderBottom: `1px solid ${c.border}`,
}
const td = (first: boolean): CSSProperties => ({
  padding: '12px 14px', verticalAlign: 'top', borderTop: first ? 'none' : `1px solid ${c.border}`,
  fontSize: fs.sm + 1, lineHeight: 1.5, color: c.muted,
})

const SUBTITLE = 'Reglas de escenas, descanso, sucesos, estados y daño'

export function AventurasPage() {
  const [tab, setTab] = useState<TabId>('escenas')
  // The rules are Cosmere (data/aventuras.ts); what differs between books is the overlay of the world of the campaign
  const world = useWorld()
  const { data, isPending } = useWorldData()

  // Stormlight never waits (its WorldData is `initialData`); Mistborn's overlay comes with its lazy chunk: wait for it instead of
  // flashing the base rules. If the chunk fails to load, `data` is undefined and the base is shown
  if (isPending) {
    return (
      <div style={page}>
        <PageHeader title="Aventuras" subtitle={SUBTITLE} />
        <Spinner />
      </div>
    )
  }
  const r = resolveAventuras(world, data?.overlays.aventuras)

  return (
    <div style={page}>
      <PageHeader title="Aventuras" subtitle={SUBTITLE} />

      <TabScroller>
        <Tabs
          tabs={TABS}
          value={tab}
          onChange={setTab}
          ariaLabel="Secciones de Aventuras"
          idPrefix="aventuras"
          style={{ maxWidth: 'none', overflowX: 'visible' }}
        />
      </TabScroller>

      {tab === 'escenas' && (
        <TabPanel idPrefix="aventuras" id="escenas">
          <SectionList sections={r.escenas} headingLevel={2} />
        </TabPanel>
      )}

      {tab === 'reposo' && (
        <TabPanel idPrefix="aventuras" id="reposo" style={stack(28)}>
          <section>
            <SectionTitle>Tipos de descanso</SectionTitle>
            <SectionList sections={r.descansos} headingLevel={3} />
          </section>
          <section>
            <SectionTitle>Actividades durante el reposo</SectionTitle>
            <div style={stack(8)}>
              {r.actividades.map((a, i) => (
                <div key={a.name} {...rise(i)}>
                  <ActividadCard actividad={a} />
                </div>
              ))}
            </div>
          </section>
        </TabPanel>
      )}

      {tab === 'sucesos' && (
        <TabPanel idPrefix="aventuras" id="sucesos">
          <SectionList sections={r.sucesos} headingLevel={2} />
        </TabPanel>
      )}

      {tab === 'estados' && (
        <TabPanel idPrefix="aventuras" id="estados" style={stack(8)}>
          <div style={{ marginBottom: 8 }}>
            <Callout>
              Los estados son condiciones que afectan temporalmente a los personajes. Salvo indicación contraria, una instancia de un estado no puede aplicarse varias veces al mismo objetivo.
            </Callout>
          </div>
          {r.estados.map((e, i) => (
            <div key={e.name} {...rise(i)}>
              <EstadoCard estado={e} />
            </div>
          ))}
        </TabPanel>
      )}

      {tab === 'dano' && (
        <TabPanel idPrefix="aventuras" id="dano" style={stack(28)}>
          {/* Reglas de daño */}
          <SectionList sections={r.dano} headingLevel={2} />

          {/* Tipos de daño */}
          <section>
            <SectionTitle>Tipos de daño</SectionTitle>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}>
              {r.tiposDano.map((t, i) => (
                <li key={t.name} {...rise(i)}>
                  <DamageTypeCard tipo={t} />
                </li>
              ))}
            </ul>
          </section>

          {/* Tabla duración lesiones */}
          <section>
            <SectionTitle id="tabla-lesiones-duracion">Tabla de lesiones — duración (d20 + modificadores)</SectionTitle>
            <div style={tableWrap}>
              <table aria-labelledby="tabla-lesiones-duracion" style={tableStyle}>
                <thead>
                  <tr>
                    <th scope="col" style={{ ...th, width: '46%' }}>Resultado</th>
                    <th scope="col" style={th}>Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {r.duracionLesiones.map((row, i) => {
                    const t = SEVERITY_TONE[row.tipo] ?? tone.cuarzo
                    return (
                      <tr key={row.tirada}>
                        <th scope="row" style={{ ...td(i === 0), textAlign: 'left', fontWeight: 'inherit' }}>
                          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                            <span style={{ ...numeral, fontSize: fs.base, color: t.fg }}>{row.tirada}</span>
                            <span style={{ ...pill(t), textTransform: 'capitalize' }}>{row.tipo}</span>
                          </span>
                        </th>
                        <td style={{ ...td(i === 0), color: c.text }}>{row.duracion}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Tabla efectos lesiones */}
          <section>
            <SectionTitle id="tabla-lesiones-efectos">Tabla de lesiones — efectos (d8)</SectionTitle>
            <div style={tableWrap}>
              <table aria-labelledby="tabla-lesiones-efectos" style={tableStyle}>
                <thead>
                  <tr>
                    <th scope="col" style={{ ...th, width: 64 }}>d8</th>
                    <th scope="col" style={{ ...th, width: '38%' }}>Efecto</th>
                    <th scope="col" style={th}>Narrativa</th>
                  </tr>
                </thead>
                <tbody>
                  {r.efectosLesiones.map((row, i) => (
                    <tr key={row.d8}>
                      <td style={{ ...td(i === 0), fontFamily: font.mono, fontSize: fs.base, fontWeight: 600, color: c.brandLight, whiteSpace: 'nowrap' }}>
                        {row.d8}
                      </td>
                      <th scope="row" style={{ ...td(i === 0), textAlign: 'left', color: c.text, fontWeight: 650 }}>{row.efecto}</th>
                      <td style={td(i === 0)}>{row.narrativa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </TabPanel>
      )}
    </div>
  )
}
