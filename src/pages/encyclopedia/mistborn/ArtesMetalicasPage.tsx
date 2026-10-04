/**
 * «Artes metálicas» of Nacidos de la bruma (encyclopedia, chapter 6, L.161-250 / PDF 167-256, plus the hemalurgy of L.251 / PDF 257 and
 * the spikes of chapter 8, L.288-292 / PDF 294-298): the index of the three metallic arts, one tab each. Alomancia and Feruquimia list
 * their 17 metals (glyph, name, effect, era) grouped by category and link to the page of each power (PoderMetalPage); both share the
 * table «Progresión de las artes metálicas» (L.163 / PDF 169). Hemalurgia is text only in v1: the twelve spikes and its rules.
 * Lazy page: it imports its data BY FILE and nothing here reaches the main chunk (§8, risk 6). The selected tab lives in the `?arte=`
 * parameter of the URL, so that coming back from a power (browser or the link of PoderMetalPage) lands on the same tab.
 */
import type { CSSProperties, ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import {
  CATEGORIAS_ALOMANCIA, CATEGORIAS_FERUQUIMIA, METALES, getMetal,
  type ArteMetal, type MetalDef, type MetalId,
} from '../../../data/mistborn/metales'
import { PROGRESION_ARTES_METALICAS, type GradosArte } from '../../../data/mistborn/progresionArtes'
import { REGLAS_HEMALURGIA, TIPOS_CLAVO, type TipoClavo } from '../../../data/mistborn/hemalurgia'
import { Card, Disclosure, PageHeader, SectionTitle, TabPanel, Tabs, type TabItem } from '../../../components/ui'
import { useEra, useWorldConfig } from '../../../store/campaignStore'
import { isAvailable } from '../../../worlds'
import { c, eyebrow, font, fs, numeral, page, pill, radius, shadow, tone } from '../../../theme'
import { EraChips, GlifoMetal, InfoList, LinkPoder, NotaLibro, Note } from './shared'

type TabId = ArteMetal | 'hemalurgia'
const TABS: TabItem<TabId>[] = [
  { id: 'alomancia', label: 'Alomancia' },
  { id: 'feruquimia', label: 'Feruquimia' },
  { id: 'hemalurgia', label: 'Hemalurgia' },
]
const esTab = (v: string | null): v is TabId => TABS.some((t) => t.id === v)

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })

const NOMBRE_ARTE: Record<ArteMetal, string> = { alomancia: 'Alomancia', feruquimia: 'Feruquimia' }

/** Opening of each tab: the art in the gold small caps of the book and what it is in a few lines */
function Intro({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <Card padding="18px 20px">
      <p style={{ ...eyebrow, color: c.gold, marginBottom: 8 }}>{etiqueta}</p>
      <p style={{ fontFamily: font.display, fontSize: fs.md + 1, color: c.muted, lineHeight: 1.6 }}>{children}</p>
    </Card>
  )
}

// ── What each art says about itself (own words; pages of the book next to each rule) ───────────────────────────────────────────────
const CONTENIDO: Record<ArteMetal, { intro: string; esencial: { label: string; value: string }[] }> = {
  alomancia: {
    intro:
      'Ingieres un metal y lo «quemas» para infundirte de Investidura. Cada metal produce un efecto propio: unos actúan sobre el mundo que ' +
      'te rodea y otros sobre ti mismo. Usas la habilidad Investida Alomancia, que se tira con Voluntad (L.161 / PDF 167; L.128 / PDF 134).',
    esencial: [
      {
        label: 'Cómo se obtiene',
        value:
          'Con el talento principal de los caminos de brumoso, nacido de la bruma o nacidoble, o con un clavo hemalúrgico (L.129 / PDF 135; ' +
          'L.290 / PDF 296).',
      },
      {
        label: 'Poder naciente',
        value:
          'Hasta que completas la meta de nacido del metal de un poder, solo manejas su versión naciente: efectos menores y narrativos. El ' +
          'atium no tiene versión naciente (L.162 / PDF 168; L.177 / PDF 183).',
      },
      {
        label: 'Investidura',
        value:
          'Es lo que gastas al quemar. Cada escena empieza con la Investidura al máximo (con 1 si empiezas Sorprendido) y se repone con la ' +
          'acción Beber vial (L.129 / PDF 135). El atium es la excepción: se llevan cuentas de atium aparte (L.176 / PDF 182).',
      },
      {
        label: 'Metales comunes y raros',
        value:
          'Los metales físicos y mentales son comunes. Los de mejora, los temporales y los divinos son raros: se llevan vial a vial ' +
          '(L.130 / PDF 136; L.167 / PDF 173).',
      },
    ],
  },
  feruquimia: {
    intro:
      'Almacenas un rasgo (la velocidad, un sentido, los recuerdos, la salud…) en una mente de metal, casi siempre a costa de debilitarte, ' +
      'y más tarde lo «decantas» para mejorarte de forma temporal. Usas la habilidad Investida Feruquimia, que se tira con Intelecto ' +
      '(L.161 / PDF 167; L.128 / PDF 134).',
    esencial: [
      {
        label: 'Cómo se obtiene',
        value:
          'Con el talento principal de los caminos de feruquimista, ferrin o nacidoble, o con un clavo hemalúrgico. Un medallón feruquímico ' +
          '(Era 2) permite usar de forma temporal de uno a tres poderes (L.131 / PDF 137; L.290 / PDF 296; L.293 / PDF 299).',
      },
      {
        label: 'Mente de metal',
        value:
          'Cada poder necesita una mente de metal hecha con su metal, que obtienes al completar la meta de nacido del metal «Fabricar tu ' +
          'mente de metal». Aunque tengas varias piezas del mismo metal, comparten una única reserva de cargas (L.131 / PDF 137).',
      },
      {
        label: 'Cargas',
        value:
          'Una mente guarda como máximo 2 cargas más tus grados en Feruquimia. Almacenar las genera con el tiempo y decantar las gasta, hasta ' +
          'tu límite de artes metálicas (L.131 / PDF 137).',
      },
      {
        label: 'Sin Investidura',
        value:
          'La feruquimia no te da una reserva de Investidura. Eso sí, una mente de metal con 1 carga o más cuenta como objeto Investido ' +
          '(L.131 / PDF 137).',
      },
      {
        label: 'Poder naciente',
        value:
          'Antes de completar la meta solo puedes manifestar efectos menores mientras tocas un objeto con mucho de ese metal: no almacenas ' +
          'ni decantas cargas (L.162 / PDF 168).',
      },
    ],
  },
}

// ── The 17 metals of an art, grouped by the category of that art (they differ between the two: L.166 / PDF 172) ─────────────────────
interface Grupo { id: string; label: string; metales: MetalDef[] }

function agrupar(arte: ArteMetal): Grupo[] {
  const etiquetas: Record<string, string> = arte === 'alomancia' ? CATEGORIAS_ALOMANCIA : CATEGORIAS_FERUQUIMIA
  const porCategoria = new Map<string, MetalDef[]>()
  for (const m of METALES) {
    const id = arte === 'alomancia' ? m.categoriaAlomancia : m.categoriaFeruquimia
    porCategoria.set(id, [...(porCategoria.get(id) ?? []), m])
  }
  return [...porCategoria].map(([id, metales]) => ({ id, label: etiquetas[id], metales }))
}

/** Alomancia: «Externo · Empujón» (null for atium: n/a in the book, L.168 / PDF 174); feruquimia: the trait the metal stores */
function rasgoDe(m: MetalDef, arte: ArteMetal): string | null {
  if (arte === 'feruquimia') return m.rasgoFeruquimico
  if (m.interno === null || m.empujon === null) return null
  return `${m.interno ? 'Interno' : 'Externo'} · ${m.empujon ? 'Empujón' : 'Tirón'}`
}

function MetalTile({ metal, arte }: { metal: MetalDef; arte: ArteMetal }) {
  const era = useEra()
  const rasgo = rasgoDe(metal, arte)

  return (
    <LinkPoder
      arte={arte}
      metal={metal.id}
      className="ui-card ui-card--interactive"
      style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px 12px 14px', minHeight: 76,
        background: c.s1, border: `1px solid ${c.border}`, borderRadius: radius.lg, boxShadow: shadow[1],
        color: c.text, textDecoration: 'none',
      }}
    >
      <GlifoMetal metal={metal.id} arte={arte} size={22} />
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2 }}>{metal.nombre}</span>
        <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.35 }}>{arte === 'alomancia' ? metal.nombreBrumoso : metal.nombreFerrin}</span>
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {rasgo && <span style={pill(tone.cuarzo)}>{rasgo}</span>}
          <EraChips eras={metal.eras} />
          {!isAvailable(metal, era) && <span style={pill(tone.topacio)}>No existe en tu era</span>}
        </span>
      </span>
      <ChevronRight size={18} aria-hidden style={{ color: c.subtle, flexShrink: 0 }} />
    </LinkPoder>
  )
}

function RejillaMetales({ arte }: { arte: ArteMetal }) {
  return (
    <div style={stack(20)}>
      {agrupar(arte).map((g, i) => {
        const titleId = `metales-${arte}-${g.id}`
        // The book defines common and rare metals for alomancia (L.167 / PDF 173), not for feruquimia
        const rareza = arte === 'alomancia' ? (g.metales.every((m) => m.comun) ? 'Comunes' : g.metales.every((m) => !m.comun) ? 'Raros' : null) : null
        return (
          <section key={g.id} aria-labelledby={titleId} className="rise" style={{ '--i': i } as CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <h3 id={titleId} style={{ ...eyebrow, fontFamily: font.ui }}>{g.label}</h3>
              {rareza && <span style={pill(rareza === 'Comunes' ? tone.esmeralda : tone.topacio)}>{rareza}</span>}
            </div>
            <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 10 }}>
              {g.metales.map((m) => (
                <li key={m.id} style={{ display: 'flex' }}>
                  <MetalTile metal={m} arte={arte} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

// ── «Progresión de las artes metálicas» (L.163 / PDF 169) ────────────────────────────────────────────────────────────────────────
const GRADOS: GradosArte[] = [0, 1, 2, 3, 4, 5, 6]

const th: CSSProperties = { ...eyebrow, textAlign: 'left', padding: '10px 10px', background: c.s2, borderBottom: `1px solid ${c.border}` }
const td = (first: boolean): CSSProperties => ({
  padding: '11px 10px', borderTop: first ? 'none' : `1px solid ${c.border}`, fontSize: fs.sm + 1, color: c.muted, verticalAlign: 'middle',
})

function ProgresionArtes() {
  const nota = PROGRESION_ARTES_METALICAS[6].notaLibro
  return (
    <section>
      <SectionTitle id="progresion-artes-metalicas">Progresión de las artes metálicas</SectionTitle>
      <div style={stack(12)}>
        <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6 }}>
          Con cada grado que ganas en tu habilidad Investida (Alomancia o Feruquimia) crecen el límite, el dado y el alcance de tus poderes
          (L.163 / PDF 169).
        </p>
        {/* Focusable scroller: on the narrowest phones (320 px) the four columns do not fit and the table scrolls sideways */}
        <div
          role="region"
          aria-labelledby="progresion-artes-metalicas"
          tabIndex={0}
          style={{ borderRadius: radius.md, border: `1px solid ${c.border}`, overflowX: 'auto', background: c.s1, boxShadow: shadow[1] }}
        >
          <table aria-labelledby="progresion-artes-metalicas" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th scope="col" style={th}>Grados</th>
                <th scope="col" style={th}>Límite</th>
                <th scope="col" style={th}>Dado</th>
                <th scope="col" style={th}>Alcance</th>
              </tr>
            </thead>
            <tbody>
              {GRADOS.map((g, i) => {
                const f = PROGRESION_ARTES_METALICAS[g]
                return (
                  <tr key={g}>
                    <th scope="row" style={{ ...td(i === 0), textAlign: 'left' }}>
                      <span style={{ ...numeral, fontSize: g === 6 ? fs.base : fs.lg, color: c.brandLight, whiteSpace: 'nowrap' }}>{g === 6 ? '6 o más*' : g}</span>
                    </th>
                    <td style={td(i === 0)}>{f.limite === 'rango' ? 'Igual al rango' : f.limite}</td>
                    <td style={{ ...td(i === 0), fontFamily: font.mono, fontWeight: 600, color: c.text }}>{f.dado === 1 ? '1 (sin tirada)' : `d${f.dado}`}</td>
                    <td style={td(i === 0)}>{f.alcance} m</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Note>* Solo es posible superar los 5 grados con la hemalurgia u otros efectos especiales (L.163 / PDF 169).</Note>
        {nota && <NotaLibro texto={nota} />}
        <InfoList
          rows={[
            {
              label: 'Límite de artes metálicas',
              value: 'Lo máximo que puedes invertir en un solo efecto, en puntos de Investidura (alomancia) o en cargas (feruquimia): tus grados en la habilidad, con un mínimo de 1.',
            },
            { label: 'Dado de artes metálicas', value: 'El dado que tiras cuando un poder pide uno (daño infligido, salud recuperada…). Crece con tus grados.' },
            {
              label: 'Alcance de artes metálicas',
              value: 'El radio dentro del cual un poder afecta a personajes y objetos. No necesita línea de efecto: los obstáculos no lo detienen.',
            },
          ]}
        />
      </div>
    </section>
  )
}

// ── Alomancia and Feruquimia ─────────────────────────────────────────────────────────────────────────────────────────────────────
function ArtePanel({ arte }: { arte: ArteMetal }) {
  const { intro, esencial } = CONTENIDO[arte]
  return (
    <TabPanel idPrefix="artes" id={arte} style={stack(28)}>
      <Intro etiqueta={NOMBRE_ARTE[arte]}>{intro}</Intro>

      <section>
        <SectionTitle>{`Metales de la ${arte}`}</SectionTitle>
        <RejillaMetales arte={arte} />
      </section>

      <ProgresionArtes />

      <section>
        <SectionTitle>{`Cómo funciona la ${arte}`}</SectionTitle>
        <InfoList rows={esencial} />
      </section>
    </TabPanel>
  )
}

// ── Hemalurgia ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** `'alomancia:hierro'` → `'hierro'`: the four options of a spike share their art, so the card names the art once */
const metalDeOpcion = (opcion: string) => opcion.split(':')[1] as MetalId

function ClavoCard({ clavo }: { clavo: TipoClavo }) {
  const metal = getMetal(clavo.metal)

  return (
    <Card as="article" padding={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <GlifoMetal metal={clavo.metal} arte="hemalurgia" size={18} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ margin: 0, fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2, color: c.text }}>Clavo de {metal.nombre.toLowerCase()}</h4>
          <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.4, marginTop: 2 }}>Roba: {clavo.roba.charAt(0).toLowerCase() + clavo.roba.slice(1)}</p>
        </div>
        <span style={{ ...pill(tone.amatista), alignSelf: 'flex-start' }}>Rango {clavo.rango}</span>
      </div>

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${c.border}` }}>
        {clavo.tipo === 'atributo' ? (
          <p style={{ fontSize: fs.base - 1, color: c.text, lineHeight: 1.5 }}>
            <strong style={{ fontWeight: 650 }}>Efecto:</strong> {clavo.efecto}
          </p>
        ) : (
          <>
            <p style={{ fontSize: fs.base - 1, color: c.text, lineHeight: 1.5, marginBottom: 8 }}>
              <strong style={{ fontWeight: 650 }}>Concede un poder a elegir.</strong> {NOMBRE_ARTE[clavo.arte]} de:
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {clavo.opciones.map((o) => {
                const m = getMetal(metalDeOpcion(o))
                return (
                  <li key={o}>
                    <LinkPoder
                      arte={clavo.arte}
                      metal={m.id}
                      aria-label={`${NOMBRE_ARTE[clavo.arte]} de ${m.nombre.toLowerCase()}`}
                      style={{ ...pill(tone.amatista), minHeight: 36, padding: '4px 14px', textDecoration: 'none' }}
                    >
                      {m.nombre}
                    </LinkPoder>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>

      {clavo.notaLibro && (
        <div style={{ marginTop: 12 }}>
          <NotaLibro texto={clavo.notaLibro} />
        </div>
      )}
    </Card>
  )
}

function HemalurgiaPanel() {
  const atributos = TIPOS_CLAVO.filter((t) => t.tipo === 'atributo')
  const poderes = TIPOS_CLAVO.filter((t) => t.tipo === 'poder')

  return (
    <TabPanel idPrefix="artes" id="hemalurgia" style={stack(28)}>
      <Intro etiqueta="Hemalurgia">
        Un clavo de metal arrebata un rasgo a una víctima, casi siempre a costa de su vida, y puede implantarse en otra persona para que lo
        gane: atributos, poderes alománticos y feruquímicos. No es un camino de nacido del metal: los personajes no fabrican clavos, solo usan
        los que la DJ les concede como recompensa (L.161 / PDF 167; L.251 / PDF 257; L.288 / PDF 294).
      </Intro>

      <section>
        <SectionTitle>Efectos de los clavos</SectionTitle>
        <div style={stack(20)}>
          <Note>
            El rango es el de recompensa del primer clavo de cada metal: cada clavo del mismo metal que ya tengas suma 1 al rango de los
            siguientes (L.288 / PDF 294; L.291 / PDF 297).
          </Note>
          <div>
            <h3 style={{ ...eyebrow, fontFamily: font.ui, marginBottom: 6 }}>Rango 2: atributos</h3>
            <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5, marginBottom: 10 }}>
              Suben un atributo en 1 y no conceden ningún poder. Se acumulan: dos clavos de hierro dan Fuerza +2 (L.288-289 / PDF 294-295).
            </p>
            <div style={stack(10)}>{atributos.map((t) => <ClavoCard key={t.metal} clavo={t} />)}</div>
          </div>
          <div>
            <h3 style={{ ...eyebrow, fontFamily: font.ui, marginBottom: 6 }}>Rango 3: poderes</h3>
            <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5, marginBottom: 10 }}>
              Conceden un poder alomántico o feruquímico completo, a elegir entre los cuatro de su grupo (L.290-291 / PDF 296-297).
            </p>
            <div style={stack(10)}>{poderes.map((t) => <ClavoCard key={t.metal} clavo={t} />)}</div>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle>Reglas de la hemalurgia</SectionTitle>
        <div style={stack(8)}>
          {REGLAS_HEMALURGIA.map((r) => (
            <Disclosure key={r.id} title={r.titulo} headingLevel={3} accent={tone.amatista.fg}>
              <div style={stack(10)}>
                <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6 }}>{r.texto}</p>
                <p style={{ fontSize: fs.sm, color: c.subtle }}>{r.cita}</p>
                {r.notaLibro && <NotaLibro texto={r.notaLibro} />}
              </div>
            </Disclosure>
          ))}
        </div>
      </section>
    </TabPanel>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function ArtesMetalicasPage() {
  const planeta = useWorldConfig().planeta
  const [params, setParams] = useSearchParams()
  const pedida = params.get('arte')
  const tab: TabId = esTab(pedida) ? pedida : 'alomancia'

  return (
    <div style={page}>
      <PageHeader title="Artes metálicas" subtitle={`Alomancia, feruquimia y hemalurgia en ${planeta}`} />

      <Tabs
        tabs={TABS}
        value={tab}
        onChange={(id) => setParams({ arte: id }, { replace: true })}
        ariaLabel="Artes metálicas"
        idPrefix="artes"
        style={{ marginBottom: 20 }}
      />

      {tab === 'hemalurgia' ? <HemalurgiaPanel /> : <ArtePanel arte={tab} />}
    </div>
  )
}
