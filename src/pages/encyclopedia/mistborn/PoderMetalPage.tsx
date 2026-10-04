/**
 * Page of one metallic power of Nacidos de la bruma (encyclopedia, route `artes-metalicas/:arte/:metal`; chapter 6, L.172-250 / PDF
 * 178-256): the alomancia or feruquimia of a metal with its basic actions, creative uses and talent tree. It also gathers what the
 * tables of metals say about the metal (category, pair, era, names) and what the book adds per power (linked charges, medallion).
 * Lazy page: it imports its data BY FILE (the 34 powers) and nothing here reaches the main chunk (§8, risk 6). The glyph of the
 * metal is the provisional one of `shared.tsx` until T46.
 */
import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { Anvil, ChevronLeft, ChevronRight } from 'lucide-react'
import { PODERES_ALOMANTICOS } from '../../../data/mistborn/alomancia'
import { PODERES_FERUQUIMICOS } from '../../../data/mistborn/feruquimia'
import { CAMINOS_NACIDOS_DEL_METAL } from '../../../data/mistborn/caminosNacidosDelMetal'
import { CATEGORIAS_ALOMANCIA, CATEGORIAS_FERUQUIMIA, getMetal, type ArteMetal, type MetalId } from '../../../data/mistborn/metales'
import type { AccionPoder, PoderDef, PoderFeruquimico } from '../../../data/mistborn/tipos'
import { Card, EmptyState, PageHeader, SectionTitle } from '../../../components/ui'
import { TalentActivation } from '../../../components/TalentActivation'
import { useWorldConfig } from '../../../store/campaignStore'
import { c, eyebrow, font, fs, numeral, page, pill, radius, shadow, tint, tone, toneFrom } from '../../../theme'
import { EraChips, EraNotice, GlifoMetal, InfoList, LinkArtes, LinkPoder, NotaLibro, Note, TalentoRow } from './shared'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })

const NOMBRE_ARTE: Record<ArteMetal, string> = { alomancia: 'Alomancia', feruquimia: 'Feruquimia' }
const OTRA_ARTE: Record<ArteMetal, ArteMetal> = { alomancia: 'feruquimia', feruquimia: 'alomancia' }

/** The power of a metal in an art; `undefined` for an unknown art or metal (the URL is free text) */
function buscarPoder(arte?: string, metal?: string): PoderDef | undefined {
  const lista: readonly PoderDef[] = arte === 'alomancia' ? PODERES_ALOMANTICOS : arte === 'feruquimia' ? PODERES_FERUQUIMICOS : []
  return lista.find((p) => p.metal === metal)
}

/** The subtitle of the entry in the book: «Físico – Externo – Empujón» (alomancia) or «Velocidad – Metal físico» (feruquimia) */
function subtitulo(poder: PoderDef): string {
  const m = getMetal(poder.metal)
  if (poder.arte === 'feruquimia') return `${m.rasgoFeruquimico} – Metal ${CATEGORIAS_FERUQUIMIA[m.categoriaFeruquimia].toLowerCase()}`
  // Atium has no inside/outside nor Tirón/Empujón: «n/a» in the table (L.168 / PDF 174); the book heads it «Metal divino» (L.176 / PDF 182)
  if (m.interno === null || m.empujon === null) return 'Metal divino'
  return [CATEGORIAS_ALOMANCIA[m.categoriaAlomancia], m.interno ? 'Interno' : 'Externo', m.empujon ? 'Empujón' : 'Tirón'].join(' – ')
}

/** What each linked-charge power asks to note down (the `cargasConVinculo` of the data says which powers do) */
const VINCULO: Partial<Record<MetalId, string>> = {
  cobre: 'una vivencia o una pericia (L.228 / PDF 234)',
  bendaleo: 'una medicina o un veneno, con los talentos que lo permiten (L.221 / PDF 227)',
  nicrosil: 'una capacidad Investida (L.246 / PDF 252)',
}

function textoMedallon(m: PoderFeruquimico['medallon']): string {
  return m.disponibleParaPJ && m.rangoRecompensa !== null
    ? `Recompensa de rango ${m.rangoRecompensa}. Un medallón guarda como máximo 8 cargas por poder y almacenar en él no genera cargas (L.293-294 / PDF 299-300).`
    : 'No se ofrece a los personajes jugadores (L.294 / PDF 300).'
}

// ── Basic action of the power ─────────────────────────────────────────────────────────────────────────────────────────────────
function Dato({ label, grow, children }: { label: string; grow: number; children: ReactNode }) {
  return (
    <div style={{ flex: `${grow} 1 ${grow * 130}px`, padding: '8px 12px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`, minWidth: 0 }}>
      <dt style={{ ...eyebrow, marginBottom: 3 }}>{label}</dt>
      <dd style={{ fontSize: fs.sm, color: c.text, lineHeight: 1.45 }}>{children}</dd>
    </div>
  )
}

function Vinietas({ items }: { items: string[] }) {
  return (
    <ul style={{ ...stack(5), margin: 0, paddingLeft: 18, listStyle: 'disc', fontSize: fs.base - 1, color: c.muted, lineHeight: 1.55 }}>
      {items.map((t) => <li key={t}>{t}</li>)}
    </ul>
  )
}

function AccionCard({ accion, ganaCargas }: { accion: AccionPoder; ganaCargas: boolean }) {
  return (
    <Card as="article" padding={16} style={stack(12)}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontFamily: font.display, fontSize: fs.lg + 1, fontWeight: 600, lineHeight: 1.2, color: c.text }}>{accion.nombre}</h3>
        <TalentActivation type={accion.activacion} />
      </div>

      <dl style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {/* In Almacenar the `duracion` of the data is the rule to gain a charge (tipos.ts) */}
        <Dato label={ganaCargas ? 'Ganancia de cargas' : 'Duración'} grow={1}>{accion.duracion}</Dato>
        <Dato label="Coste" grow={2}>{accion.coste}</Dato>
      </dl>

      <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6 }}>{accion.descripcion}</p>

      {accion.efectos && accion.efectos.length > 0 && <Vinietas items={accion.efectos} />}

      {accion.opciones && accion.opciones.length > 0 && (
        <div style={stack(8)}>
          {accion.opciones.map((o) => (
            <div key={o.nombre} style={{ padding: '10px 14px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}>
              <h4 style={{ margin: 0, fontFamily: font.ui, fontSize: fs.base - 1, fontWeight: 650, color: c.text, lineHeight: 1.3, marginBottom: 4 }}>{o.nombre}</h4>
              <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.55 }}>{o.descripcion}</p>
            </div>
          ))}
        </div>
      )}

      {accion.mantener && (
        <p style={{ fontSize: fs.sm, color: c.subtle, lineHeight: 1.5 }}>
          <strong style={{ color: c.muted, fontWeight: 650 }}>Mantener.</strong> {accion.mantener}
        </p>
      )}
    </Card>
  )
}

// ── Table of the duration of a stored memory by degrees (feruquimia de cobre only) ─────────────────────────────────────────────
const th: CSSProperties = { ...eyebrow, textAlign: 'left', padding: '10px 12px', background: c.s2, borderBottom: `1px solid ${c.border}` }
const td = (first: boolean): CSSProperties => ({
  padding: '11px 12px', borderTop: first ? 'none' : `1px solid ${c.border}`, fontSize: fs.sm + 1, color: c.muted, verticalAlign: 'middle',
})

function TablaPorGrados({ filas }: { filas: NonNullable<PoderFeruquimico['tablaPorGrados']> }) {
  return (
    <div>
      <h3 id="tabla-por-grados" style={{ ...eyebrow, fontFamily: font.ui, marginBottom: 8 }}>Duración de la vivencia por grados</h3>
      <div style={{ borderRadius: radius.md, border: `1px solid ${c.border}`, overflow: 'hidden', background: c.s1, boxShadow: shadow[1] }}>
        <table aria-labelledby="tabla-por-grados" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={th}>Grados en Feruquimia</th>
              <th scope="col" style={th}>Duración máxima</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={f.grados}>
                <th scope="row" style={{ ...td(i === 0), textAlign: 'left' }}>
                  <span style={{ ...numeral, fontSize: fs.lg, color: c.brandLight }}>{f.grados === 6 ? '6 o más' : f.grados}</span>
                </th>
                <td style={td(i === 0)}>{f.valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: fs.sm, color: c.subtle, marginTop: 8 }}>L.228 / PDF 234</p>
    </div>
  )
}

// ── Link row to another power ────────────────────────────────────────────────────────────────────────────────────────────────
function FilaPoder({ arte, metal, detalle }: { arte: ArteMetal; metal: MetalId; detalle: string }) {
  return (
    <LinkPoder
      arte={arte}
      metal={metal}
      className="ui-card ui-card--interactive"
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px 12px 14px', minHeight: 64,
        background: c.s1, border: `1px solid ${c.border}`, borderRadius: radius.lg, boxShadow: shadow[1], color: c.text, textDecoration: 'none',
      }}
    >
      <GlifoMetal metal={metal} arte={arte} size={18} />
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2 }}>{`${NOMBRE_ARTE[arte]} de ${getMetal(metal).nombre.toLowerCase()}`}</span>
        <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.35 }}>{detalle}</span>
      </span>
      <ChevronRight size={18} aria-hidden style={{ color: c.subtle, flexShrink: 0 }} />
    </LinkPoder>
  )
}

// ── Page of one power ──────────────────────────────────────────────────────────────────────────────────────────────────────────
function PoderDetalle({ poder }: { poder: PoderDef }) {
  const cfg = useWorldConfig()
  const metal = getMetal(poder.metal)
  const t = toneFrom(metal.color)
  const pareja = metal.pareja ? getMetal(metal.pareja) : null
  const alomancia = poder.arte === 'alomancia'

  // Paths whose main talent unlocks the tree (the paths of the data, with the provisional icon and the data colour of each one)
  const caminos = poder.caminos.map((id) => CAMINOS_NACIDOS_DEL_METAL.find((p) => p.id === id)).filter((p) => p !== undefined)

  const filas: { label: string; value: ReactNode }[] = [
    { label: 'Habilidad Investida', value: `${NOMBRE_ARTE[poder.arte]}, con ${poder.atributo}` },
  ]
  if (poder.arte === 'feruquimia') {
    filas.push({ label: 'Rasgo que almacena', value: metal.rasgoFeruquimico })
    filas.push({ label: 'Cargas máximas', value: '2 + tus grados en Feruquimia (L.131 / PDF 137).' })
    if (poder.cargasConVinculo) {
      filas.push({ label: 'Cargas con vínculo', value: `Anotas a qué está ligada cada carga: ${VINCULO[poder.metal] ?? 'lo que guardas en ella'}.` })
    }
  }
  if (pareja) {
    filas.push({
      label: 'Metal emparejado',
      value: (
        <>
          <LinkPoder arte={poder.arte} metal={pareja.id} className="ui-link">{pareja.nombre}</LinkPoder>
          {metal.puro ? ', su aleación' : ', su metal puro'}
        </>
      ),
    })
  }
  const sinArbol = poder.talentos.length === 0
  filas.push({
    // A power without a tree has no «Es posible desbloquear este árbol mediante…» line in the book (alomancia de aluminio, feruquimia de nicrosil)
    label: sinArbol ? 'Caminos que pueden elegirlo' : 'Se desbloquea con',
    value: (
      <>
        <ul style={{ listStyle: 'none', display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
          {caminos.map((p) => {
            const tc = toneFrom(p.color)
            return (
              <li key={p.id} style={pill(tc)}>
                {cfg.iconos.caminoInvestido(p.id, 13)}
                {p.name}
              </li>
            )
          })}
        </ul>
        <span style={{ fontSize: fs.sm, color: c.subtle }}>
          {sinArbol
            ? 'Sin árbol de talentos, el libro no dice qué talento principal lo desbloquea.'
            : 'El talento principal de estos caminos de nacido del metal o un clavo hemalúrgico, como indica la cabecera del árbol de cada poder.'}
        </span>
      </>
    ),
  })
  if (poder.arte === 'feruquimia') filas.push({ label: 'Medallón feruquímico (Era 2)', value: textoMedallon(poder.medallon) })

  const ganaCargas = (a: AccionPoder) => poder.arte === 'feruquimia' && a === poder.almacenar

  return (
    <div style={page}>
      <LinkArtes
        arte={poder.arte}
        className="ui-link"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minHeight: 44, marginBottom: 4, fontSize: fs.sm, fontWeight: 600, textDecoration: 'none' }}
      >
        <ChevronLeft size={16} aria-hidden />
        Artes metálicas
      </LinkArtes>

      <PageHeader eyebrow={NOMBRE_ARTE[poder.arte]} title={poder.name} subtitle={subtitulo(poder)} />

      <div style={stack(28)}>
        <div style={stack(14)}>
          {/* The metal: glyph, name and the colloquial name of its users, with the eras and what sets the power apart */}
          <div
            style={{
              ...stack(12), padding: '14px 16px', borderRadius: radius.lg,
              background: `linear-gradient(180deg, ${tint(metal.color, 16)}, ${tint(metal.color, 4)})`, border: `1px solid ${t.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <GlifoMetal metal={poder.metal} arte={poder.arte} size={26} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, lineHeight: 1.15, color: c.text }}>{metal.nombre}</p>
                <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 2 }}>
                  {alomancia ? `Brumoso: ${metal.nombreBrumoso}` : `Ferrin: ${metal.nombreFerrin}`}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <EraChips eras={poder.eras} />
              {alomancia && <span style={pill(metal.comun ? tone.esmeralda : tone.topacio)}>{metal.comun ? 'Metal común' : 'Metal raro'}</span>}
              {!poder.requiereMeta && <span style={pill(tone.amatista)}>Sin versión naciente</span>}
            </div>
          </div>

          <EraNotice eras={poder.eras} />

          <p style={{ fontFamily: font.display, fontSize: fs.md + 1, color: c.muted, lineHeight: 1.6 }}>{poder.descripcion}</p>

          {poder.notaLibro && <NotaLibro texto={poder.notaLibro} />}
          {/* What the era tables say about the metal itself (aluminio, duraluminio, electro and oro come to light at the end of Era 1) */}
          {metal.notaLibro && <NotaLibro texto={metal.notaLibro} />}
        </div>

        <section>
          <SectionTitle>Datos del poder</SectionTitle>
          <InfoList rows={filas} />
        </section>

        <section>
          <SectionTitle>Acciones</SectionTitle>
          <div style={stack(12)}>
            {poder.acciones.map((a) => <AccionCard key={a.nombre} accion={a} ganaCargas={ganaCargas(a)} />)}
            {poder.arte === 'feruquimia' && poder.tablaPorGrados && <TablaPorGrados filas={poder.tablaPorGrados} />}
          </div>
        </section>

        {poder.usosCreativos.length > 0 && (
          <section>
            <SectionTitle>Usos creativos</SectionTitle>
            <div style={stack(12)}>
              <Note>
                Mientras tu poder es naciente solo puedes manifestar pequeños efectos narrativos: estas ideas sirven de inspiración (L.162 / PDF 168).
              </Note>
              <InfoList rows={poder.usosCreativos.map((u) => ({ label: u.nombre, value: u.texto }))} />
            </div>
          </section>
        )}

        <section>
          <SectionTitle>{sinArbol ? 'Talentos' : `Talentos (${poder.talentos.length})`}</SectionTitle>
          <div style={stack(12)}>
            {sinArbol ? (
              <Note>En el libro este poder no tiene árbol de talentos.</Note>
            ) : (
              <>
                {poder.requiereMeta && (
                  <Note>
                    No puedes elegir estos talentos hasta completar la meta de nacido del metal de este poder (L.166 / PDF 172).
                  </Note>
                )}
                <div style={stack(6)}>
                  {poder.talentos.map((tal) => <TalentoRow key={tal.name} talento={tal} headingLevel={3} />)}
                </div>
              </>
            )}
          </div>
        </section>

        <section>
          <SectionTitle>Ver también</SectionTitle>
          <ul style={{ listStyle: 'none', ...stack(8) }}>
            {pareja && (
              <li>
                <FilaPoder arte={poder.arte} metal={pareja.id} detalle={metal.puro ? 'Su aleación emparejada' : 'Su metal puro emparejado'} />
              </li>
            )}
            <li>
              <FilaPoder arte={OTRA_ARTE[poder.arte]} metal={poder.metal} detalle={`El mismo metal en ${OTRA_ARTE[poder.arte] === 'alomancia' ? 'la alomancia' : 'la feruquimia'}`} />
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}

// ── Route component ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function PoderMetalPage() {
  const { arte, metal } = useParams<{ arte: string; metal: string }>()
  const poder = buscarPoder(arte, metal)

  // The app does not restore the scroll on a route change: coming from the long list of metals the page would open halfway down
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [arte, metal])

  if (!poder) {
    return (
      <div style={page}>
        <PageHeader title="Artes metálicas" subtitle="Alomancia, feruquimia y hemalurgia" />
        <EmptyState
          icon={<Anvil size={24} aria-hidden />}
          title="No encontramos ese poder"
          description="La dirección no corresponde a ninguna alomancia ni feruquimia de la enciclopedia."
          action={
            <LinkArtes className="ui-link" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontWeight: 600 }}>
              Ver las artes metálicas
            </LinkArtes>
          }
        />
      </div>
    )
  }

  return <PoderDetalle poder={poder} />
}
