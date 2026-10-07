/**
 * «Orígenes» of Nacidos de la bruma (encyclopedia, chapter 2, L.31-48 / PDF 37-54): the three ancestries (with their talent
 * trees), the kandra Blessings and the cultural skills of each era. Lazy page: it imports its data BY FILE and nothing here
 * reaches the main chunk (§8, risk 6). Same look as RadiantOrdersPage: tabs, cards that open a hero sheet, accordions.
 */
import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import {
  ASCENDENCIAS_MB, BENDICIONES_KANDRA, CULTURAS, MAX_CULTURAS,
  type AscendenciaMB, type BendicionKandra, type Cultura,
} from '../../../data/mistborn/origenes'
import type { Era } from '../../../types'
import type { AttrField } from '../../../worlds/types'
import { Disclosure, PageHeader, SectionTitle, Segmented, Tabs, TabPanel, type TabItem } from '../../../components/ui'
import { useEra, useWorldConfig } from '../../../store/campaignStore'
import { isAvailable } from '../../../worlds'
import { c, font, fs, page, pill, radius, shadow, titleText, tone, type Tone } from '../../../theme'
import { EraChips, EraNotice, HeroSheet, InfoList, Note, NotaLibro, TalentoRow } from './shared'

type TabId = 'ascendencias' | 'bendiciones' | 'culturas'
const TABS: TabItem<TabId>[] = [
  { id: 'ascendencias', label: 'Ascendencias' },
  { id: 'bendiciones', label: 'Bendiciones' },
  { id: 'culturas', label: 'Culturas' },
]

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
/** «Nivel 1», «Niveles 6, 11, 16 y 21» */
const etiquetaNiveles = (n: number[]) => (n.length === 1 ? `Nivel ${n[0]}` : `Niveles ${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}`)
/** `{ fuerza: 6 }` → «Fuerza 6» */
const etiquetaAtributos = (r: Partial<Record<AttrField, number>>) => Object.entries(r).map(([k, v]) => `${cap(k)} ${v}`).join(', ')
const nombreObjetivo = (o: AttrField | 'desvio') => (o === 'desvio' ? 'Desvío' : cap(o))

/** Tone and icon of an ancestry come from the world configuration (the same ones as the sheet), not from this page */
function useAscendenciaDef(id: string): { t: Tone; icono: (size: number) => ReactNode } {
  const def = useWorldConfig().ascendencias.find((a) => a.id === id)
  return { t: def?.tone ?? tone.cuarzo, icono: (size) => def?.icono(size) ?? null }
}

// ── Ancestry card ────────────────────────────────────────────
function AscendenciaCard({ asc, onClick }: { asc: AscendenciaMB; onClick: () => void }) {
  const { t, icono } = useAscendenciaDef(asc.id)
  const era = useEra()

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
        {icono(24)}
      </span>

      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2, color: c.text }}>{asc.nombre}</span>
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <EraChips eras={asc.eras} />
          <span style={pill(t)}>{asc.puntosAtributoBase} puntos de atributo</span>
          {!isAvailable(asc, era) && <span style={pill(tone.topacio)}>No existe en tu era</span>}
        </span>
        <span
          style={{
            fontSize: fs.sm, color: c.muted, lineHeight: 1.45,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {asc.descripcion}
        </span>
      </span>

      <ChevronRight size={18} aria-hidden style={{ color: c.subtle }} />
    </button>
  )
}

// ── Ancestry detail (sheet content) ──────────────────────────
function AscendenciaDetail({ asc, titleId }: { asc: AscendenciaMB; titleId: string }) {
  const { t, icono } = useAscendenciaDef(asc.id)
  const reglas = asc.bendiciones

  const filas: { label: string; value: ReactNode }[] = [
    { label: 'Puntos de atributo', value: `${asc.puntosAtributoBase} para repartir entre los seis atributos en el paso 3 de la creación` },
    { label: 'Tamaño', value: asc.tamano },
  ]
  if (asc.topeAtributo) filas.push({ label: 'Valor máximo de atributo', value: etiquetaAtributos(asc.topeAtributo) })
  if (asc.topeCreacion) filas.push({ label: 'Puntos máximos en un atributo al crear', value: etiquetaAtributos(asc.topeCreacion) })
  filas.push({
    label: 'Caminos de nacido del metal',
    value: asc.permiteCaminoMetal
      ? 'Puede elegirlos (cada camino indica qué ascendencias admite)'
      : 'No puede elegir talentos de ningún camino de nacido del metal (L.18 / PDF 24)',
  })
  if (reglas) {
    filas.push({
      label: 'Bendiciones',
      value: `${reglas.alCrear === 1 ? 'Una' : reglas.alCrear} al crear; en el rango ${reglas.segundaEnRango}, una segunda y distinta como recompensa (máximo ${reglas.maximo}). Están en la pestaña Bendiciones.`,
    })
  }

  return (
    <>
      {/* Hero */}
      <div style={{ padding: '16px 20px 20px', background: `linear-gradient(180deg, ${t.bg}, transparent)`, borderBottom: `1px solid ${t.border}` }}>
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
            {icono(28)}
          </span>
          <div style={{ minWidth: 0 }}>
            <h2 id={titleId} style={{ ...titleText, fontSize: fs['2xl'] - 2, color: c.text }}>{asc.nombre}</h2>
            <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              <EraChips eras={asc.eras} />
              <span style={pill(t)}>Tamaño {asc.tamano}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ ...stack(24), padding: '24px 20px 0' }}>
        <EraNotice eras={asc.eras} />

        <section>
          <SectionTitle as="h3">Descripción</SectionTitle>
          <p style={{ fontFamily: font.display, fontSize: fs.md + 1, color: c.muted, lineHeight: 1.6 }}>{asc.descripcion}</p>
        </section>

        <section>
          <SectionTitle as="h3">Reglas de creación</SectionTitle>
          <InfoList rows={filas} />
        </section>

        <section>
          <SectionTitle as="h3">Beneficios</SectionTitle>
          <div style={stack(8)}>
            {asc.beneficios.map((b) => (
              <article key={b.titulo} style={{ padding: '12px 14px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h4 style={{ fontFamily: font.ui, fontSize: fs.base - 1, fontWeight: 650, color: c.text, lineHeight: 1.3 }}>{b.titulo}</h4>
                  <span style={pill(t)}>{etiquetaNiveles(b.niveles)}</span>
                </div>
                <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.55 }}>{b.texto}</p>
              </article>
            ))}
          </div>
        </section>

        {asc.notas && (
          <section>
            <SectionTitle as="h3">A tener en cuenta</SectionTitle>
            <ul style={{ ...stack(8), listStyle: 'none' }}>
              {asc.notas.map((n) => (
                <li key={n}>
                  <Note>{n}</Note>
                </li>
              ))}
            </ul>
          </section>
        )}

        {asc.arbol.talentos.length > 0 && (
          <section>
            <SectionTitle as="h3">Árbol de talentos</SectionTitle>
            <div style={stack(6)}>
              {asc.arbol.talentos.map((tal) => (
                <TalentoRow key={tal.name} talento={tal} concedido={asc.arbol.autoGranted.includes(tal.name)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

// ── Blessing card ────────────────────────────────────────────
function BendicionCard({ bendicion, t }: { bendicion: BendicionKandra; t: Tone }) {
  return (
    <article className="ui-card" style={{ background: c.s1, border: `1px solid ${c.border}`, borderRadius: radius.lg, boxShadow: shadow[1], padding: 16 }}>
      <h2 style={{ margin: 0, fontFamily: font.display, fontSize: fs.lg + 2, fontWeight: 600, lineHeight: 1.2, color: c.text }}>{bendicion.nombre}</h2>
      <ul aria-label="Bonos" style={{ listStyle: 'none', display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0' }}>
        {bendicion.bonos.map((b) => (
          <li key={b.objetivo} style={pill(t)}>+{b.valor} {nombreObjetivo(b.objetivo)}</li>
        ))}
      </ul>
      <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.55 }}>{bendicion.descripcion}</p>
      {bendicion.notaLibro && (
        <div style={{ marginTop: 12 }}>
          <NotaLibro texto={bendicion.notaLibro} />
        </div>
      )}
    </article>
  )
}

function BendicionesPanel() {
  const kandra = ASCENDENCIAS_MB.find((a) => a.bendiciones)
  const { t } = useAscendenciaDef(kandra?.id ?? '')
  const reglas = kandra?.bendiciones

  return (
    <TabPanel idPrefix="origenes" id="bendiciones" style={stack(10)}>
      {reglas && (
        <Note>
          Solo los kandra reciben Bendiciones: eliges {reglas.alCrear === 1 ? 'una' : reglas.alCrear} al crear el personaje y, como recompensa en el rango{' '}
          {reglas.segundaEnRango}, puedes obtener otra distinta (máximo {reglas.maximo}). Son aumentos permanentes: también se aplican bajo Disfraz kandra
          y cuentan para los prerrequisitos de los talentos (L.28 / PDF 34; L.34-35 / PDF 40-41).
        </Note>
      )}
      {BENDICIONES_KANDRA.map((b, i) => (
        <div key={b.id} className="rise" style={{ '--i': i } as CSSProperties}>
          <BendicionCard bendicion={b} t={t} />
        </div>
      ))}
    </TabPanel>
  )
}

// ── Cultural skills ──────────────────────────────────────────
function CulturaDetalle({ cultura }: { cultura: Cultura }) {
  const { eleccion } = cultura
  const filas: { label: string; value: ReactNode }[] = [{ label: 'Qué sabes', value: cultura.pericia }]
  if (eleccion) {
    filas.push({
      label: eleccion.etiqueta,
      value: (
        <>
          {eleccion.opciones ? (
            <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: eleccion.repetible ? 6 : 0 }}>
              {eleccion.opciones.map((o) => <span key={o} style={pill(tone.cuarzo)}>{o}</span>)}
            </span>
          ) : (
            <span style={{ display: 'block', marginBottom: eleccion.repetible ? 6 : 0 }}>A tu elección</span>
          )}
          {eleccion.repetible && <span style={{ fontSize: fs.sm, color: c.subtle }}>Puedes volver a tomar la pericia con otra elección.</span>}
        </>
      ),
    })
  }
  if (cultura.restriccion) filas.push({ label: 'Quién puede elegirla', value: cultura.restriccion })
  if (cultura.notaJuego) filas.push({ label: 'En juego', value: cultura.notaJuego })

  return <InfoList rows={filas} />
}

function CulturasPanel() {
  const defs = useWorldConfig().eras ?? []
  const era = useEra()
  // The campaign era is the default filter: the era only filters options and never hides them for good (§3 b)
  const [filtro, setFiltro] = useState<Era | 'todas'>(era ?? 'todas')
  const visibles = CULTURAS.filter((cu) => filtro === 'todas' || isAvailable(cu, filtro))
  const grupos = [
    ...defs.map((d) => ({ clave: d.id as string, titulo: `Pericias culturales de la ${d.label}`, items: visibles.filter((cu) => cu.eras.length === 1 && cu.eras[0] === d.id) })),
    { clave: 'ambas', titulo: 'Pericias culturales de ambas eras', items: visibles.filter((cu) => cu.eras.length > 1) },
  ].filter((g) => g.items.length > 0)

  return (
    <TabPanel idPrefix="origenes" id="culturas" style={stack(24)}>
      <div style={stack(12)}>
        <Note>
          En el paso 1 de la creación eliges hasta {MAX_CULTURAS} pericias culturales (L.18 / PDF 24; L.40 / PDF 46). Las de una era solo se eligen en esa era;
          las de ambas eras, en cualquiera. Con la aprobación de la DJ puedes crear otras: regiones o subculturas que no figuren aquí (L.47 / PDF 53).
        </Note>
        <Segmented
          ariaLabel="Filtrar las pericias por era"
          value={filtro}
          onChange={setFiltro}
          options={[{ value: 'todas', label: 'Todas' }, ...defs.map((d) => ({ value: d.id, label: d.label }))]}
        />
      </div>

      {grupos.map((g) => (
        <section key={g.clave} aria-labelledby={`culturas-${g.clave}`}>
          <SectionTitle as="h2" id={`culturas-${g.clave}`}>{g.titulo}</SectionTitle>
          <div style={stack(10)}>
            {g.items.map((cu, i) => (
              <div key={cu.id} className="rise" style={{ '--i': i } as CSSProperties}>
                <Disclosure title={cu.nombre} summary={cu.resumen} headingLevel={3} accent={tone.granate.fg}>
                  <CulturaDetalle cultura={cu} />
                </Disclosure>
              </div>
            ))}
          </div>
        </section>
      ))}
    </TabPanel>
  )
}

// ── Main page ────────────────────────────────────────────────
export function OrigenesPage() {
  const planeta = useWorldConfig().planeta
  const [tab, setTab] = useState<TabId>('ascendencias')
  const [selected, setSelected] = useState<AscendenciaMB | null>(null)
  const sheetTitleId = useId()

  return (
    <div style={page}>
      <PageHeader title="Orígenes" subtitle={`Ascendencias, Bendiciones y pericias culturales de ${planeta}`} />

      <Tabs tabs={TABS} value={tab} onChange={setTab} ariaLabel="Secciones de Orígenes" idPrefix="origenes" style={{ marginBottom: 20 }} />

      {tab === 'ascendencias' && (
        <TabPanel idPrefix="origenes" id="ascendencias" style={stack(14)}>
          <Note>
            Tu ascendencia es la especie de la que desciendes: la eliges en el paso 1 de la creación y te da talentos y capacidades propios (L.18 / PDF 24;
            L.32 / PDF 38).
          </Note>
          <ul aria-label="Ascendencias" style={{ listStyle: 'none', ...stack(10) }}>
            {ASCENDENCIAS_MB.map((asc, i) => (
              <li key={asc.id} className="rise" style={{ '--i': i } as CSSProperties}>
                <AscendenciaCard asc={asc} onClick={() => setSelected(asc)} />
              </li>
            ))}
          </ul>
        </TabPanel>
      )}

      {tab === 'bendiciones' && <BendicionesPanel />}

      {tab === 'culturas' && <CulturasPanel />}

      <HeroSheet open={!!selected} onClose={() => setSelected(null)} labelledBy={sheetTitleId}>
        {/* key: the sheet content starts from the top for every ancestry */}
        {selected && <AscendenciaDetail key={selected.id} asc={selected} titleId={sheetTitleId} />}
      </HeroSheet>
    </div>
  )
}
