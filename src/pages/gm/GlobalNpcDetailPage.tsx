import { useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Save, X } from 'lucide-react'
import { globalNpcsApi } from '../../api/global-npcs'
import { useCampaignStore, useWorldConfig } from '../../store/campaignStore'
import { COLUMNAS_COSMERE } from '../../worlds/skills'
import type { AtributosColumna, AttrField, HabilidadDef } from '../../worlds/types'
import { Button, Card, ErrorMessage, Field, IconButton, Input, Spinner, TabPanel, Tabs, Textarea } from '../../components/ui'
import { CosmereIcon } from '../../components/CosmereIcon'
import { StatIcons } from '../../lib/gameIcons'
import { c, eyebrow, font, fs, numeral, page, pill, radius, shadow, tint, titleText, tone, type Tone } from '../../theme'
import type { GlobalNpc } from '../../types'

/** Numeric fields of GlobalNpc (attributes, skills, resources) */
type NumKey = { [K in keyof GlobalNpc]-?: GlobalNpc[K] extends number ? K : never }[keyof GlobalNpc]
type TextKey = 'apariencia' | 'notas'

/** The three columns of the page. The skills of each one and the two attributes that head it (its tiles and its defense) come from the world */
const COLUMNAS = [
  { key: 'fisico', label: 'Físico', tone: tone.granate },
  { key: 'cognitivo', label: 'Cognitivo', tone: tone.zafiro },
  { key: 'espiritual', label: 'Espiritual', tone: tone.amatista },
] as const

const ATTR_CODES: Record<AttrField, string> = {
  fuerza: 'FUE', velocidad: 'VEL', intelecto: 'INT', voluntad: 'VOL', discernimiento: 'DIS', presencia: 'PRE',
}

/** Cards of the page: `habilidades` decides which skills go in each column, `columnas` which two attributes head it */
const buildSections = (habilidades: HabilidadDef[], columnas: AtributosColumna) => COLUMNAS.map((col) => ({
  ...col,
  attrs: columnas[col.key].map((k): [NumKey, string] => [k, ATTR_CODES[k]]),
  skills: habilidades
    .filter((h) => h.columna === col.key)
    .map((h): [NumKey, string, NumKey, string] => [h.field, h.label, h.atributo, h.codigo]),
}))

const TEXT_FIELDS: [TextKey, string][] = [
  ['apariencia', 'Apariencia'],
  ['notas', 'Notas'],
]

const RESOURCES: { label: string; key: NumKey; tone: Tone; Icon: typeof StatIcons.salud }[] = [
  { label: 'Salud', key: 'maxHealth', tone: tone.granate, Icon: StatIcons.salud },
  { label: 'Concentración', key: 'maxConcentration', tone: tone.heliodoro, Icon: StatIcons.concentracion },
  { label: 'Investidura', key: 'maxInvestiture', tone: tone.amatista, Icon: StatIcons.investidura },
]

const ATTR_NAMES: Record<string, string> = {
  fuerza: 'Fuerza', velocidad: 'Velocidad', intelecto: 'Intelecto',
  discernimiento: 'Discernimiento', voluntad: 'Voluntad', presencia: 'Presencia',
}

type Tab = 'stats' | 'lore'

/** 0 on phones, `px` from 640px (media query in an inline style), as in CharacterDetailPage */
const fromTablet = (px: number) => `clamp(0px, calc((100vw - 640px) * 999), ${px}px)`

/* ─── Local building blocks ─────────────────────────────── */

/** Card heading in the book's small caps, with a gem-coloured rombo */
function CardHeading({ id, t, children }: { id: string; t: Tone; children: ReactNode }) {
  return (
    <h2
      id={id}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: font.display, fontVariantCaps: 'all-small-caps', fontSize: fs.xl,
        fontWeight: 650, letterSpacing: '0.06em', lineHeight: 1.2, color: t.fg,
      }}
    >
      <CosmereIcon name="ornamento-rombo" size={10} />
      {children}
    </h2>
  )
}

/** Multiline text split into paragraphs; "Nombre: descripción" gets its name set in bold, like the book's stat blocks */
function Paragraphs({ text, reading = false }: { text: string; reading?: boolean }) {
  if (!text) return <p style={{ fontSize: fs.base, color: c.subtle, lineHeight: 1.5 }}>—</p>
  const paragraphs = text.split('\n').filter((line: string) => line.trim() !== '')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {paragraphs.map((para: string, i: number) => {
        const m = reading ? null : /^([^:]{1,60}):(\s.*)$/.exec(para)
        return (
          <p
            key={i}
            style={{
              margin: 0, color: c.text,
              fontFamily: reading ? font.display : font.ui,
              fontSize: reading ? fs.md + 1 : fs.base,
              lineHeight: reading ? 1.6 : 1.55,
              paddingLeft: 12, borderLeft: '2px solid var(--gold-border)',
            }}
          >
            {m ? <><strong style={{ fontWeight: 700 }}>{m[1]}:</strong>{m[2]}</> : para}
          </p>
        )
      })}
    </div>
  )
}

export function GlobalNpcDetailPage() {
  const { npcId } = useParams<{ campaignId: string; npcId: string }>()
  const id = Number(npcId)
  const qc = useQueryClient()
  const location = useLocation()
  const { isGm } = useCampaignStore()
  const cfg = useWorldConfig()
  const [editing, setEditing] = useState(!!(location.state as { editing?: boolean } | null)?.editing)
  const [form, setForm] = useState<GlobalNpc | null>(null)
  const [tab, setTab] = useState<Tab>('stats')

  const { data: npc, isLoading, isError } = useQuery<GlobalNpc>({
    queryKey: ['global-npc', id],
    queryFn: () => globalNpcsApi.getById(id),
  })

  // Resync the edit form every time the loaded npc object changes (render-time sync instead of an effect)
  const [syncedNpc, setSyncedNpc] = useState<GlobalNpc | undefined>(undefined)
  if (npc && npc !== syncedNpc) {
    setSyncedNpc(npc)
    setForm({ ...npc })
  }

  const updateMutation = useMutation({
    mutationFn: () => globalNpcsApi.update(id, form ?? {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['global-npc', id] }); qc.invalidateQueries({ queryKey: ['global-npcs'] }); setEditing(false) },
  })

  // A failed fetch used to spin forever: say so instead
  if (isError && !npc) return <div style={page}><ErrorMessage message="No se pudo cargar el NPC. Inténtalo de nuevo." /></div>
  if (isLoading || !npc) return <Spinner />

  const f = (editing && form ? form : npc) as GlobalNpc
  const set = (k: keyof GlobalNpc) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => p ? { ...p, [k]: e.target.type === 'number' ? Number((e.target as HTMLInputElement).value) : e.target.value } : p)
  const setText = (k: 'name' | 'tipo' | 'source' | 'ascendencia') => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((p) => p ? { ...p, [k]: e.target.value } : p)

  const rubi = tone.rubi
  const numberInput: CSSProperties = { textAlign: 'center', ...numeral, fontSize: fs.lg, padding: '6px 8px' }
  // Until T50 Stormlight reads its own legacy table and grouping; every other world reads the book's (no world id is compared here)
  const sections = buildSections(cfg.habilidadesPnj ?? cfg.habilidades, cfg.columnasPnj ?? COLUMNAS_COSMERE)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', paddingBottom: 32 }}>

      {/* ─── Hero ─── */}
      <section
        aria-labelledby="npc-name"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '24px 16px 20px',
          background: [
            `radial-gradient(120% 110% at 100% 0%, ${tint(rubi.fg, 20)}, transparent 62%)`,
            `radial-gradient(80% 70% at 0% 100%, ${tint('var(--gold-ornament)', 10)}, transparent 70%)`,
            'color-mix(in srgb, var(--surface-1) 72%, transparent)',
          ].join(', '),
          // full-bleed on phones; a framed card from 640px (so the tint never ends in a hard edge)
          borderStyle: 'solid',
          borderColor: c.border,
          borderWidth: `${fromTablet(1)} ${fromTablet(1)} 1px`,
          borderRadius: fromTablet(radius.lg),
          marginTop: fromTablet(16),
          // aligned with the tab panel cards (16px gutter) from 640px
          marginLeft: fromTablet(16),
          marginRight: fromTablet(16),
          boxShadow: shadow[1],
        }}
      >
        <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, background: 'var(--gold-rule)' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          {/* Avatar */}
          <div
            aria-hidden
            style={{
              width: 64, height: 64, borderRadius: radius.md, flexShrink: 0, overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: npc.imageUrl ? c.s2 : `radial-gradient(120% 120% at 30% 20%, ${tint(rubi.fg, 22)}, var(--surface-2))`,
              border: `1.5px solid ${rubi.border}`,
              boxShadow: 'var(--shadow-1)',
              ...titleText, fontSize: fs['2xl'], color: rubi.fg,
            }}
          >
            {npc.imageUrl
              ? <img src={npc.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : npc.name[0]?.toUpperCase() ?? '?'
            }
          </div>

          {/* Name, tipo, source */}
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <p style={{ ...eyebrow, color: 'var(--gold)', marginBottom: 6, overflowWrap: 'anywhere' }}>
              {f.source || 'Adversario'}
              {f.ascendencia && ' · '}
              {f.ascendencia}
            </p>
            <h1 id="npc-name" style={{ ...titleText, fontSize: 'clamp(22px, 6vw, 28px)', color: c.text, overflowWrap: 'anywhere' }}>
              {f.name || npc.name}
            </h1>
            {f.tipo && !editing && (
              <p style={{ fontFamily: font.display, fontStyle: 'italic', fontSize: fs.md + 1, fontWeight: 600, lineHeight: 1.3, color: rubi.fg, marginTop: 6 }}>
                {f.tipo}
              </p>
            )}
          </div>

          {/* GM: edit */}
          {isGm && !editing && (
            <IconButton label="Editar NPC" variant="surface" size={44} onClick={() => setEditing(true)}>
              <Edit2 size={18} aria-hidden />
            </IconButton>
          )}
        </div>

        {/* GM: edit identity fields */}
        {editing && (
          <div style={{ position: 'relative', marginTop: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <Field label="Nombre">
                <Input value={form?.name ?? ''} onChange={setText('name')} />
              </Field>
              <Field label="Tipo">
                <Input value={form?.tipo ?? ''} onChange={setText('tipo')} placeholder="Tipo..." />
              </Field>
              <Field label="Fuente">
                <Input value={form?.source ?? ''} onChange={setText('source')} placeholder="Fuente..." />
              </Field>
              <Field label="Ascendencia">
                <Input value={form?.ascendencia ?? ''} onChange={setText('ascendencia')} placeholder="Ascendencia..." />
              </Field>
            </div>
          </div>
        )}

        {/* Resources */}
        <div style={{ position: 'relative', display: 'flex', gap: 8, marginTop: 20 }}>
          {RESOURCES.map(({ label, key, tone: t, Icon }) => (
            <div
              key={key}
              style={{
                flex: '1 1 auto', minWidth: 0,
                background: c.s1, border: `1px solid ${c.border}`, borderRadius: radius.md,
                padding: '10px 10px 0', overflow: 'hidden', boxShadow: 'var(--shadow-1)',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {editing ? (
                <label htmlFor={`npc-res-${key}`} style={{ ...eyebrow, letterSpacing: '0.03em', color: t.fg, marginBottom: 6 }}>{label}</label>
              ) : (
                <span style={{ ...eyebrow, letterSpacing: '0.03em', color: t.fg, marginBottom: 6 }}>{label}</span>
              )}
              {editing
                ? <Input id={`npc-res-${key}`} type="number" min={0} value={form?.[key] ?? 0} onChange={set(key)} style={{ ...numeral, fontSize: fs.lg, padding: '6px 8px', minHeight: 40, marginBottom: 10 }} />
                : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Icon size={16} aria-hidden style={{ color: t.fg }} />
                    <span style={{ ...numeral, fontSize: fs.xl + 2, color: c.text }}>{f[key] ?? 0}</span>
                  </div>
                )
              }
              <div aria-hidden style={{ height: 3, margin: '0 -10px', background: `linear-gradient(90deg, ${tint(t.fg, 55)}, ${t.fg})` }} />
            </div>
          ))}
        </div>

        {/* GM: cancel / save while editing */}
        {isGm && editing && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <IconButton label="Cancelar edición" variant="surface" size={44} onClick={() => { setForm({ ...npc }); setEditing(false); if (updateMutation.isError) updateMutation.reset() }}>
              <X size={18} aria-hidden />
            </IconButton>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              icon={<Save size={16} aria-hidden />}
              style={{ minWidth: 132 }}
            >
              {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        )}
        {isGm && editing && updateMutation.isError && (
          <ErrorMessage message="No se pudieron guardar los cambios. Inténtalo de nuevo." style={{ position: 'relative', marginTop: 12 }} />
        )}
      </section>

      {/* ─── Tabs ─── */}
      <div style={{ padding: '16px 16px 0' }}>
        <Tabs<Tab>
          tabs={[{ id: 'stats', label: 'Stats' }, { id: 'lore', label: 'Lore' }]}
          value={tab}
          onChange={setTab}
          ariaLabel="Secciones del NPC"
          idPrefix="npc"
        />
      </div>

      <TabPanel idPrefix="npc" id={tab} style={{ padding: 16 }}>

        {/* STATS TAB */}
        {tab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sections.map((section, si) => {
              const t = section.tone
              const defense = 10 + (f[section.attrs[0][0]] ?? 0) + (f[section.attrs[1][0]] ?? 0)
              const headingId = `npc-sec-${section.key}`
              return (
                <Card
                  key={section.key}
                  as="section"
                  padding={0}
                  aria-labelledby={headingId}
                  className="rise"
                  style={{ '--i': si, overflow: 'hidden', border: `1px solid ${t.border}` } as CSSProperties}
                >
                  <div style={{ padding: '8px 12px 8px 16px', background: t.bg, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <CardHeading id={headingId} t={t}>{section.label}</CardHeading>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: fs.xs, fontWeight: 650, color: c.muted }}>Def.</span>
                      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 42 }}>
                        <CosmereIcon name="marco-defensa" size={42} style={{ position: 'absolute', inset: 0, margin: 'auto', color: t.fg }} />
                        <span style={{ ...numeral, position: 'relative', fontSize: fs.lg, color: c.text, marginTop: 2 }}>{defense}</span>
                      </span>
                    </span>
                  </div>

                  {/* Attributes */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${t.border}` }}>
                    {section.attrs.map(([k, label]) => {
                      const inputId = `npc-attr-${k}`
                      return (
                        <div key={k} style={{ textAlign: 'center', padding: '10px 8px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}>
                          {editing
                            ? <Input id={inputId} type="number" min={0} max={5} value={form?.[k] ?? 0} onChange={set(k)} style={{ ...numberInput, fontSize: fs.xl }} />
                            : <div style={{ ...numeral, fontSize: fs['2xl'], color: c.text }}>{f[k] ?? 0}</div>
                          }
                          {editing ? (
                            <label htmlFor={inputId} style={{ ...eyebrow, display: 'block', color: t.fg, marginTop: 6 }}>
                              <abbr title={ATTR_NAMES[k]} style={{ textDecoration: 'none' }}>{label}</abbr>
                            </label>
                          ) : (
                            <div style={{ ...eyebrow, color: t.fg, marginTop: 6 }}>
                              <abbr title={ATTR_NAMES[k]} style={{ textDecoration: 'none' }}>{label}</abbr>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Skills */}
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {section.skills.map(([k, label, attrKey, attrLabel], idx) => {
                      const base = f[k] ?? 0
                      const bonus = f[attrKey] ?? 0
                      const total = base + bonus
                      const pct = Math.min(100, (base / 5) * 100)
                      return (
                        <li key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, padding: '6px 16px', borderTop: idx === 0 ? 'none' : `1px solid ${c.border}` }}>
                          <span style={{ ...pill(t), padding: '2px 7px', fontSize: fs.eyebrow, letterSpacing: '0.06em', flexShrink: 0 }}>
                            <abbr title={ATTR_NAMES[attrKey]} style={{ textDecoration: 'none' }}>{attrLabel}</abbr>
                          </span>
                          <span style={{ fontSize: fs.base, color: c.text, flex: 1, minWidth: 0 }}>{label}</span>
                          {editing
                            ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                <Input type="number" min={0} max={10} value={base} onChange={set(k)} aria-label={label} style={{ ...numberInput, fontSize: fs.base, width: 64, minHeight: 40, padding: '4px 6px' }} />
                                <span style={{ fontSize: fs.sm, color: c.muted, fontVariantNumeric: 'tabular-nums', minWidth: 24 }}>+{bonus}</span>
                              </div>
                            : <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                <div aria-hidden style={{ width: 48, height: 4, borderRadius: 4, background: c.track, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', borderRadius: 4, background: t.fg, width: `${pct}%` }} />
                                </div>
                                <span style={{ fontSize: fs.xs, color: c.subtle, minWidth: 28, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{base}+{bonus}</span>
                                <span style={{ ...numeral, fontSize: fs.lg, color: total > 0 ? c.text : c.subtle, minWidth: 22, textAlign: 'right' }}>{total}</span>
                              </div>
                          }
                        </li>
                      )
                    })}
                  </ul>
                </Card>
              )
            })}

            {/* Talentos (traits) */}
            <Card
              as="section"
              padding={0}
              aria-labelledby="npc-talentos"
              className="rise"
              style={{ '--i': sections.length, overflow: 'hidden', border: `1px solid ${tone.gold.border}` } as CSSProperties}
            >
              <div style={{ padding: '12px 16px', background: tone.gold.bg, borderBottom: `1px solid ${tone.gold.border}` }}>
                <CardHeading id="npc-talentos" t={tone.gold}>Talentos</CardHeading>
              </div>
              <div style={{ padding: 16 }}>
                {editing
                  ? <Textarea
                      aria-labelledby="npc-talentos"
                      value={form?.talentos ?? ''}
                      onChange={(e) => setForm((p) => p ? { ...p, talentos: e.target.value } : p)}
                      placeholder="Rasgos especiales del adversario..."
                      rows={4}
                      style={{ lineHeight: 1.6 }}
                    />
                  : <Paragraphs text={f.talentos || ''} />
                }
              </div>
            </Card>
          </div>
        )}

        {/* LORE TAB */}
        {tab === 'lore' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TEXT_FIELDS.map(([k, label], i) => {
              const headingId = `npc-lore-${k}`
              return (
                <Card
                  key={k}
                  as="section"
                  aria-labelledby={headingId}
                  className="rise"
                  padding="16px 16px 20px"
                  style={{ '--i': i } as CSSProperties}
                >
                  <div style={{ marginBottom: 12 }}>
                    <CardHeading id={headingId} t={tone.gold}>{label}</CardHeading>
                    <div aria-hidden style={{ height: 1, marginTop: 6, background: 'var(--gold-rule)' }} />
                  </div>
                  {editing
                    ? <Textarea
                        aria-labelledby={headingId}
                        value={form?.[k] ?? ''}
                        onChange={(e) => setForm((p) => p ? { ...p, [k]: e.target.value } : p)}
                        placeholder={`${label}...`}
                        rows={4}
                        style={{ lineHeight: 1.6 }}
                      />
                    : <Paragraphs text={f[k] || ''} reading />
                  }
                </Card>
              )
            })}
          </div>
        )}
      </TabPanel>
    </div>
  )
}
