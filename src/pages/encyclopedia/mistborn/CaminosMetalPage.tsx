/**
 * «Caminos de nacido del metal» of Nacidos de la bruma (encyclopedia, chapter 5, L.127-159 / PDF 133-165): the five paths that
 * unlock alomancia, feruquimia or both. Lazy page: it imports its data BY FILE and nothing here reaches the main chunk (§8,
 * risk 6). Same look as HeroicPathsPage: cards that open a hero sheet; inside, one tab per block of the path (main talent,
 * what it grants, tree, goal). The glyph of each path is the provisional Lucide one of the world configuration until T46.
 */
import { useId, useState, type CSSProperties } from 'react'
import { ChevronRight, Star } from 'lucide-react'
import {
  CAMINOS_NACIDOS_DEL_METAL,
  type CaminoNacidoDelMetal, type SeleccionMeta,
} from '../../../data/mistborn/caminosNacidosDelMetal'
import { PageHeader, SectionTitle, Tabs, TabPanel, type TabItem } from '../../../components/ui'
import { TalentActivation } from '../../../components/TalentActivation'
import { useEra, useWorldConfig } from '../../../store/campaignStore'
import { isAvailable } from '../../../worlds'
import { c, eyebrow, font, fs, page, pill, radius, shadow, tint, titleText, tone, toneFrom } from '../../../theme'
import { EraChips, EraNotice, HeroSheet, InfoList, NotaLibro, Note, TalentoRow } from './shared'

type SeccionId = 'principal' | 'concede' | 'arbol' | 'meta'
const SECCIONES: TabItem<SeccionId>[] = [
  { id: 'principal', label: 'Principal' },
  { id: 'concede', label: 'Qué concede' },
  { id: 'arbol', label: 'Árbol' },
  { id: 'meta', label: 'Meta' },
]

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Arts a path gives access to, in the book's order (the «Artes metálicas» column of the table of L.19 / PDF 25) */
function artesDe(p: CaminoNacidoDelMetal): string[] {
  const artes: string[] = []
  if (p.poderes.alomancia !== 0) artes.push('Alomancia')
  if (p.poderes.feruquimia !== 0) artes.push('Feruquimia')
  return artes
}

/** «Un poder alomántico», «Todos los poderes feruquímicos»… as the «Artes metálicas» column of L.19 / PDF 25 words it */
function textoPoderes(p: CaminoNacidoDelMetal['poderes']): string {
  if (p.alomancia === 1 && p.feruquimia === 1) return 'Un poder alomántico y otro feruquímico'
  const partes: string[] = []
  if (p.alomancia !== 0) partes.push(p.alomancia === 'todos' ? 'Todos los poderes alománticos de tu era' : 'Un poder alomántico')
  if (p.feruquimia !== 0) partes.push(p.feruquimia === 'todos' ? 'Todos los poderes feruquímicos de tu era' : 'Un poder feruquímico')
  return partes.join(' y ')
}

/** The book calls the main talent «de ruptura» (alomantic paths) or «de herencia» (feruchemical ones): the first word of its name (L.128 / PDF 134) */
const tipoPrincipal = (nombre: string) => (nombre.startsWith('Herencia') ? 'Talento de herencia' : 'Talento de ruptura')

/** How the first goal picks the powers (§7.5; L.135 / PDF 141, L.141 / PDF 147, L.146 / PDF 152, L.155 / PDF 161) */
const SELECCION_META: Record<SeleccionMeta, string> = {
  'uno': 'Eliges el poder que obtienes.',
  'pareja': 'Obtienes todos los poderes, pero eliges la pareja de metales Empujón/Tirón cuya meta entrenas primero.',
  'puro-aleacion-o-atium': 'Obtienes todos los poderes, pero eliges un metal puro y su aleación (o el atium) para la primera meta.',
  'uno-por-arte': 'Eliges un poder de cada arte: el mismo metal o metales distintos.',
}

// ── Path card ────────────────────────────────────────────────
function CaminoCard({ camino, onClick }: { camino: CaminoNacidoDelMetal; onClick: () => void }) {
  const cfg = useWorldConfig()
  const era = useEra()
  const t = toneFrom(camino.color)

  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className="ui-card ui-card--interactive"
      style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 14px 14px 16px', minHeight: 84, textAlign: 'left', cursor: 'pointer',
        background: c.s1, border: `1px solid ${c.border}`, borderRadius: radius.lg, boxShadow: shadow[1],
        color: c.text, font: 'inherit',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 48, height: 48, borderRadius: radius.md, flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
        }}
      >
        {cfg.iconos.caminoInvestido(camino.id, 24)}
      </span>

      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2, color: c.text }}>{camino.name}</span>
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {artesDe(camino).map((a) => <span key={a} style={pill(t)}>{a}</span>)}
          <EraChips eras={camino.eras} />
          {camino.soloExperimentados && <span style={pill(tone.topacio)}>Para expertos</span>}
          {!isAvailable(camino, era) && <span style={pill(tone.topacio)}>No existe en tu era</span>}
        </span>
      </span>

      <ChevronRight size={18} aria-hidden style={{ color: c.subtle }} />
    </button>
  )
}

// ── Path detail (sheet content) ──────────────────────────────
function InvestidasTexto({ camino }: { camino: CaminoNacidoDelMetal }) {
  const defs = useWorldConfig().habilidadesInvestidas
  return (
    <>
      {camino.habilidadesInvestidas.map((h) => {
        const atributo = defs.find((d) => d.nombre === h.nombre)?.atributo
        return (
          <span key={h.nombre} style={{ display: 'block' }}>
            {h.nombre}{atributo ? ` (${cap(atributo)})` : ''}, {h.grados === 1 ? '1 grado inicial' : `${h.grados} grados iniciales`}
          </span>
        )
      })}
    </>
  )
}

function CaminoDetail({ camino, titleId }: { camino: CaminoNacidoDelMetal; titleId: string }) {
  const cfg = useWorldConfig()
  const [seccion, setSeccion] = useState<SeccionId>('principal')
  const t = toneFrom(camino.color)
  const prefix = `camino-${camino.id}`

  const filas = [
    { label: 'Eras', value: <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><EraChips eras={camino.eras} /></span> },
    {
      label: 'Habilidad inicial',
      value: camino.habilidadInicial
        ? `${camino.habilidadInicial}: un grado gratuito si este es tu camino inicial (L.19 / PDF 25)`
        : 'Ninguna: no obtienes ningún grado gratuito',
    },
    { label: 'Habilidades Investidas', value: <InvestidasTexto camino={camino} /> },
    { label: 'Poderes', value: `${textoPoderes(camino.poderes)}. Al principio solo manejas su versión naciente.` },
    { label: 'Elección de poderes', value: SELECCION_META[camino.seleccionMeta] },
    {
      label: 'Investidura',
      value: camino.concedeInvestidura
        ? 'Obtienes Investidura y la acción Beber vial.'
        : 'No: la feruquimia no usa Investidura (L.131 / PDF 137).',
    },
    {
      label: 'Ascendencias',
      value: `${camino.ascendenciasPermitidas.join(' y ')}. Los kandra no pueden elegir ningún camino de nacido del metal (L.18 / PDF 24).`,
    },
  ]

  return (
    <>
      {/* Hero */}
      <div
        style={{
          padding: '16px 20px 20px',
          background: `linear-gradient(180deg, ${tint(camino.color, 18)}, ${tint(camino.color, 4)})`,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div aria-hidden className="ui-sheet-handle" style={{ marginTop: -6 }} />
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', paddingRight: 52, paddingTop: 4 }}>
          <span
            aria-hidden
            style={{
              width: 56, height: 56, borderRadius: radius.md, flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: t.bg, border: `1.5px solid ${t.border}`, color: t.fg,
            }}
          >
            {cfg.iconos.caminoInvestido(camino.id, 28)}
          </span>
          <div style={{ minWidth: 0 }}>
            <h2 id={titleId} style={{ ...titleText, fontSize: fs['2xl'] - 2, color: c.text }}>{camino.name}</h2>
            <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              <EraChips eras={camino.eras} />
              {camino.habilidadInicial && (
                <span style={{ ...pill(t), whiteSpace: 'normal' }}>
                  <Star size={12} aria-hidden />
                  Habilidad inicial: {camino.habilidadInicial}
                </span>
              )}
              {camino.soloExperimentados && <span style={pill(tone.topacio)}>Solo para jugadores experimentados</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ ...stack(20), padding: '24px 20px 0' }}>
        <EraNotice eras={camino.eras} />

        <p style={{ fontFamily: font.display, fontSize: fs.md + 1, color: c.muted, lineHeight: 1.6 }}>{camino.definition}</p>

        <Tabs
          tabs={SECCIONES}
          value={seccion}
          onChange={setSeccion}
          ariaLabel={`Secciones del camino ${camino.name}`}
          idPrefix={prefix}
          stretch
          size="sm"
        />

        {seccion === 'principal' && (
          <TabPanel idPrefix={prefix} id="principal" style={stack(14)}>
            <section>
              <SectionTitle as="h3">Talento principal</SectionTitle>
              <article style={{ padding: '14px 16px', borderRadius: radius.md, background: c.s2, border: `1px solid ${t.border}` }}>
                <p style={{ ...eyebrow, color: t.fg, marginBottom: 6 }}>{tipoPrincipal(camino.mainTalent)}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                  <h4 style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, color: c.text, lineHeight: 1.25 }}>{camino.mainTalent}</h4>
                  <TalentActivation type={camino.mainTalentActivation} />
                </div>
                <p style={{ fontSize: fs.sm, color: c.subtle, fontStyle: 'italic', marginBottom: 8 }}>Prerrequisito: {camino.mainTalentPrerequisites}</p>
                <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6, fontStyle: 'italic', marginBottom: 8 }}>{camino.mainTalentRolDescription}</p>
                <p style={{ fontSize: fs.base - 1, color: c.text, lineHeight: 1.6 }}>{camino.mainTalentEffect}</p>
              </article>
            </section>
            {camino.notaLibro && <NotaLibro texto={camino.notaLibro} />}
          </TabPanel>
        )}

        {seccion === 'concede' && (
          <TabPanel idPrefix={prefix} id="concede" style={stack(14)}>
            <section>
              <SectionTitle as="h3">Qué concede el camino</SectionTitle>
              <InfoList rows={filas} />
            </section>
          </TabPanel>
        )}

        {seccion === 'arbol' && (
          <TabPanel idPrefix={prefix} id="arbol" style={stack(14)}>
            <section>
              <SectionTitle as="h3">Árbol de talentos ({camino.talentos.length})</SectionTitle>
              <div style={stack(6)}>
                {camino.talentos.map((tal) => <TalentoRow key={tal.name} talento={tal} />)}
              </div>
            </section>
            <Note>
              El talento principal es la raíz del árbol y no figura en la lista. Además, cada poder que desbloqueas tiene su propio árbol de talentos, que solo
              puedes usar cuando completas la meta de ese poder (L.127 / PDF 133; L.132 / PDF 138). Esos árboles están en Artes metálicas.
            </Note>
          </TabPanel>
        )}

        {seccion === 'meta' && (
          <TabPanel idPrefix={prefix} id="meta" style={stack(14)}>
            <section>
              <SectionTitle as="h3">{camino.metasIniciales.length === 1 ? 'Meta de nacido del metal' : 'Metas de nacido del metal'}</SectionTitle>
              <div style={stack(8)}>
                {camino.metasIniciales.map((m) => (
                  <article key={m.titulo + m.arte} style={{ padding: '12px 14px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <h4 style={{ fontFamily: font.ui, fontSize: fs.base - 1, fontWeight: 650, color: c.text, lineHeight: 1.3 }}>{m.titulo}</h4>
                      <span style={pill(t)}>{cap(m.arte)}</span>
                    </div>
                    <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.55 }}>{m.descripcion}</p>
                  </article>
                ))}
              </div>
            </section>
            <Note>
              Hasta completar la meta solo manejas la versión naciente de tu poder; al completarla desbloqueas la versión completa y los talentos de su árbol
              (L.132 / PDF 138).
            </Note>
          </TabPanel>
        )}
      </div>
    </>
  )
}

// ── Main page ────────────────────────────────────────────────
export function CaminosMetalPage() {
  const [selected, setSelected] = useState<CaminoNacidoDelMetal | null>(null)
  const sheetTitleId = useId()
  const planeta = useWorldConfig().planeta

  return (
    <div style={page}>
      <PageHeader title="Caminos de nacido del metal" subtitle={`Los cinco caminos que dan acceso a la alomancia y la feruquimia en ${planeta}`} />

      <div style={{ marginBottom: 16 }}>
        <Note>
          Funcionan como los caminos heroicos, pero son excluyentes: en cuanto eliges el talento principal de uno, no puedes acceder a ningún otro. Puedes
          elegirlo en cualquier nivel (L.127-128 / PDF 133-134).
        </Note>
      </div>

      <ul aria-label="Caminos de nacido del metal" style={{ listStyle: 'none', ...stack(10) }}>
        {CAMINOS_NACIDOS_DEL_METAL.map((camino, i) => (
          <li key={camino.id} className="rise" style={{ '--i': i } as CSSProperties}>
            <CaminoCard camino={camino} onClick={() => setSelected(camino)} />
          </li>
        ))}
      </ul>

      <HeroSheet open={!!selected} onClose={() => setSelected(null)} labelledBy={sheetTitleId}>
        {/* key: the section tab starts at «Principal» for every path */}
        {selected && <CaminoDetail key={selected.id} camino={selected} titleId={sheetTitleId} />}
      </HeroSheet>
    </div>
  )
}
