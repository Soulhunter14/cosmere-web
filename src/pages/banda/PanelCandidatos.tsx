/**
 * «Candidatos» of the «Trabajadores» tab: who the crew may hire, the only way to hire. Everyone with access sees them (name, trade,
 * wage, faction, trait) and hires one as their character; the director generates them, edits them before publishing, sees their private
 * part (rank, metal, loyalty, secret) and withdraws them. They do not expire.
 */
import { useState } from 'react'
import { Dices, Lock, RefreshCw, Trash2, UserPlus, X } from 'lucide-react'
import {
  Badge, Button, Card, ConfirmDialog, ErrorMessage, Field, IconButton, Input, SectionTitle, Segmented, Select, Sheet, Stepper, Textarea,
} from '../../components/ui'
import { MetalGlyph } from '../../components/mistborn/MetalGlyph'
import { isAvailable } from '../../worlds'
import type { CatalogoBanda, RangoPnj } from '../../lib/banda/tipos'
import type { Era } from '../../types'
import { c, font, fs } from '../../theme'
import type { Actor, BandaEstado, BandaSecretos, Candidato, TrabajadorPrivado } from './estado'
import { faccionesPropiasDe, nombreFaccion, nombreOficio, ocupaPlaza, sueldoSugerido, topeTrabajadores, type OpBanda } from './operaciones'
import { contratarCandidato, datosDeOficio, generarCandidato, publicarCandidatos, retirarCandidato, type BorradorCandidato } from './candidatos'
import { RANGO, leerCantidad, textoSuave, useEjecutar } from './etiquetas'
import { CampoCantidad, Puntos, SelectorActor } from './piezas'

interface Props {
  banda: BandaEstado
  secretos: BandaSecretos
  catalogo: CatalogoBanda
  era: Era | null
  /** Director: generates, sees the private part, withdraws */
  editable: boolean
  /** Director or a player with access: hires, as a character */
  puedeActuar: boolean
  actores: Actor[]
  dinero: (v: number) => string
  aplicar: (op: OpBanda) => void
}

const etiquetaCampo = { fontSize: fs.sm, fontWeight: 650, color: c.text, marginBottom: 6 } as const
const aTexto = (v: number) => String(v).replace('.', ',')

export function SeccionCandidatos({ banda, secretos, catalogo, era, editable, puedeActuar, actores, dinero, aplicar }: Props) {
  const [generando, setGenerando] = useState(false)
  const [contratando, setContratando] = useState<Candidato | null>(null)
  const [retirando, setRetirando] = useState<Candidato | null>(null)
  const { error, ejecutar } = useEjecutar(aplicar)
  const doc = { banda, secretos }
  const tope = topeTrabajadores(banda, catalogo)
  const libres = tope - banda.trabajadores.filter(ocupaPlaza).length

  return (
    <section style={{ display: 'grid', gap: 10 }}>
      <SectionTitle
        as="h3"
        action={editable
          ? <Button size="sm" variant="secondary" icon={<Dices size={15} aria-hidden />} onClick={() => setGenerando(true)}>Buscar candidatos</Button>
          : undefined}
      >
        Candidatos{banda.candidatos.length ? ` (${banda.candidatos.length})` : ''}
      </SectionTitle>
      {banda.candidatos.length === 0 ? (
        <p style={textoSuave}>
          {editable
            ? 'Nadie busca trabajo con la banda todavía. Genera candidatos y publica los que quieras ofrecer.'
            : 'Aún no hay candidatos: el director los irá proponiendo.'}
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {banda.candidatos.map((cand) => (
            <TarjetaCandidato
              key={cand.id}
              cand={cand}
              faccion={cand.faccion ? nombreFaccion(cand.faccion, doc, catalogo) : null}
              privado={editable ? (secretos.trabajadores[cand.id] ?? null) : null}
              secreto={editable ? secretos.secretos[cand.id] : undefined}
              catalogo={catalogo}
              dinero={dinero}
              puedeActuar={puedeActuar}
              editable={editable}
              libres={libres}
              onContratar={() => setContratando(cand)}
              onRetirar={() => setRetirando(cand)}
            />
          ))}
        </div>
      )}
      {puedeActuar && banda.candidatos.length > 0 && libres <= 0 && (
        <p style={textoSuave}>No quedan plazas: con escala {banda.escala}, la banda tiene como máximo {tope} trabajadores.</p>
      )}
      {error && <ErrorMessage message={error} />}

      {generando && (
        <GeneradorSheet banda={banda} secretos={secretos} catalogo={catalogo} era={era} dinero={dinero} onClose={() => setGenerando(false)} aplicar={aplicar} />
      )}
      {contratando && (
        <ContratarSheet
          cand={contratando} actores={actores} dinero={dinero} libres={libres} tope={tope}
          onClose={() => setContratando(null)} aplicar={aplicar}
        />
      )}
      <ConfirmDialog
        open={!!retirando}
        title={`¿Retirar a ${retirando?.nombre ?? ''}?`}
        message="Deja de ser candidato y nadie podrá contratarlo. El registro lo conserva."
        confirmLabel="Retirar"
        onConfirm={() => { if (retirando) ejecutar(retirarCandidato(retirando.id)); setRetirando(null) }}
        onCancel={() => setRetirando(null)}
      />
    </section>
  )
}

function TarjetaCandidato({ cand, faccion, privado, secreto, catalogo, dinero, puedeActuar, editable, libres, onContratar, onRetirar }: {
  cand: Candidato
  /** Name of their faction, when whoever looks knows it */
  faccion: string | null
  /** Only the director has it */
  privado: TrabajadorPrivado | null
  secreto: string | undefined
  catalogo: CatalogoBanda
  dinero: (v: number) => string
  puedeActuar: boolean
  editable: boolean
  libres: number
  onContratar: () => void
  onRetirar: () => void
}) {
  const metal = privado?.nacidoDelMetal ? catalogo.metales?.find((m) => m.id === privado.nacidoDelMetal) : undefined
  return (
    <Card padding={14} style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, color: c.text, lineHeight: 1.25 }}>{cand.nombre}</h4>
          <p style={{ ...textoSuave, marginTop: 2 }}>
            {nombreOficio(cand, catalogo)} · {dinero(cand.sueldo)} por semana{faccion ? ` · ${faccion}` : ''}
          </p>
          {cand.rasgo && <p style={{ ...textoSuave, fontStyle: 'italic' }}>{cand.rasgo}</p>}
        </div>
        {editable && <IconButton label={`Retirar a ${cand.nombre}`} onClick={onRetirar}><Trash2 size={18} aria-hidden /></IconButton>}
      </div>
      {privado && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: fs.sm, color: 'var(--gm)' }}>
          <Lock size={14} aria-hidden />
          <span className="sr-only">Solo el director: </span>
          <Badge tone="cuarzo">{RANGO[privado.rango]}</Badge>
          {metal && (
            <Badge tone="amatista">
              <MetalGlyph metal={metal.id} arte="alomancia" size={14} />
              {metal.nombre}
            </Badge>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: c.muted }}>
            Lealtad <Puntos valor={privado.lealtad} max={3} tono="zafiro" etiqueta="Lealtad" />
          </span>
          {secreto && <span>{secreto}</span>}
        </div>
      )}
      {puedeActuar && (
        <div>
          <Button size="sm" icon={<UserPlus size={15} aria-hidden />} onClick={onContratar} disabled={libres <= 0}>Contratar</Button>
        </div>
      )}
    </Card>
  )
}

/** Hiring a candidate: a character decides (the director, for one of them); it takes a place and is paid every week */
function ContratarSheet({ cand, actores, dinero, libres, tope, onClose, aplicar }: {
  cand: Candidato
  actores: Actor[]
  dinero: (v: number) => string
  libres: number
  tope: number
  onClose: () => void
  aplicar: (op: OpBanda) => void
}) {
  const pjs = actores.filter((a) => a.tipo === 'pj')
  const [actor, setActor] = useState<Actor | null>(pjs.length === 1 ? pjs[0] : null)
  const { error, ejecutar } = useEjecutar(aplicar)
  return (
    <Sheet
      open
      onClose={onClose}
      title={`¿Contratar a ${cand.nombre}?`}
      description={`Cobra ${dinero(cand.sueldo)} por semana y ocupa una plaza (quedan ${libres} de ${tope}).`}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>No contratar</Button>
          <Button icon={<UserPlus size={15} aria-hidden />} onClick={() => ejecutar(contratarCandidato(cand.id, actor), onClose)} disabled={!actor}>Contratar</Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <SelectorActor actores={pjs} valor={actor} onChange={setActor} conDirector={false} etiqueta="¿Quién lo contrata?" />
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

/**
 * The generator (director): roll candidates (of a trade or at random), edit each one (a new roll, or any field: the wage follows the
 * trade and rank until typed by hand) and publish them. The players will see name, trade, wage, faction and trait
 */
function GeneradorSheet({ banda, secretos, catalogo, era, dinero, onClose, aplicar }: {
  banda: BandaEstado
  secretos: BandaSecretos
  catalogo: CatalogoBanda
  era: Era | null
  dinero: (v: number) => string
  onClose: () => void
  aplicar: (op: OpBanda) => void
}) {
  const oficios = catalogo.oficios.filter((o) => isAvailable(o, era))
  const facciones = [...catalogo.facciones.filter((f) => isAvailable(f, era) && !f.enemiga), ...faccionesPropiasDe({ banda, secretos }, catalogo)]
  const [oficioFiltro, setOficioFiltro] = useState('')
  const [cuantos, setCuantos] = useState(1)
  const [borradores, setBorradores] = useState<BorradorCandidato[]>([])
  // What was typed in each wage (null: it follows the trade and rank)
  const [sueldos, setSueldos] = useState<(string | null)[]>([])
  const { error, ejecutar } = useEjecutar(aplicar)

  // The names of the drafts count as taken, so a new roll does not repeat them
  const conBorradores = (lista: BorradorCandidato[]): BandaEstado => ({
    ...banda,
    candidatos: [...banda.candidatos, ...lista.map((b, i) => ({ id: `borrador-${i}`, ...b.publico, desde: '' }))],
  })
  const tirar = (otros: BorradorCandidato[]) => generarCandidato(catalogo, era, conBorradores(otros), oficioFiltro || null)

  const generar = () => {
    const nuevos: BorradorCandidato[] = []
    for (let i = 0; i < cuantos; i++) nuevos.push(tirar([...borradores, ...nuevos]))
    setBorradores([...borradores, ...nuevos])
    setSueldos([...sueldos, ...nuevos.map(() => null)])
  }
  const otraTirada = (i: number) => {
    setBorradores(borradores.map((b, j) => (j === i ? tirar(borradores.filter((_, k) => k !== i)) : b)))
    setSueldos(sueldos.map((s, j) => (j === i ? null : s)))
  }
  const quitar = (i: number) => {
    setBorradores(borradores.filter((_, j) => j !== i))
    setSueldos(sueldos.filter((_, j) => j !== i))
  }
  const cambiar = (i: number, cambio: (b: BorradorCandidato) => BorradorCandidato) => setBorradores(borradores.map((b, j) => (j === i ? cambio(b) : b)))
  // A new trade brings its rank and metal; the wage follows them while it was not typed by hand
  const cambiarOficio = (i: number, oficio: string) => cambiar(i, (b) => {
    const { rango, metal, sueldo } = datosDeOficio(catalogo, era, oficio)
    return {
      ...b,
      publico: { ...b.publico, oficio, ...(sueldos[i] === null ? { sueldo } : {}) },
      privado: { ...b.privado, rango, nacidoDelMetal: metal },
    }
  })
  const cambiarRango = (i: number, rango: RangoPnj) => cambiar(i, (b) => ({
    ...b,
    publico: { ...b.publico, ...(sueldos[i] === null ? { sueldo: sueldoSugerido(catalogo, era, rango, !!b.privado.nacidoDelMetal) } : {}) },
    privado: { ...b.privado, rango },
  }))
  const cambiarSueldo = (i: number, texto: string) => {
    setSueldos(sueldos.map((s, j) => (j === i ? texto : s)))
    const n = leerCantidad(texto)
    cambiar(i, (b) => ({ ...b, publico: { ...b.publico, sueldo: Number.isFinite(n) ? n : 0 } }))
  }

  const n = borradores.length
  return (
    <Sheet
      open
      onClose={onClose}
      maxWidth={600}
      title="Buscar candidatos"
      description="Genera candidatos, retócalos y publica los que quieras ofrecer. Los jugadores verán nombre, oficio, sueldo, facción y rasgo; el resto solo tú."
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => ejecutar(publicarCandidatos(borradores), onClose)} disabled={n === 0 || borradores.some((b) => !b.publico.nombre.trim())}>
            {n === 1 ? 'Publicar 1 candidato' : `Publicar ${n} candidatos`}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12, alignItems: 'end' }}>
          <Field label="Oficio">
            <Select value={oficioFiltro} onChange={(e) => setOficioFiltro(e.target.value)}>
              <option value="">Al azar</option>
              {oficios.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </Select>
          </Field>
          <div>
            <p style={etiquetaCampo}>Cuántos</p>
            <Stepper label="Cuántos candidatos" value={cuantos} onChange={setCuantos} min={1} max={3} />
          </div>
        </div>
        <div>
          <Button variant="secondary" icon={<Dices size={16} aria-hidden />} onClick={generar}>Generar</Button>
        </div>

        {borradores.map((b, i) => (
          <Card key={i} padding={12} style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
              <Field label="Nombre" style={{ flex: 1 }}>
                <Input value={b.publico.nombre} onChange={(e) => cambiar(i, (x) => ({ ...x, publico: { ...x.publico, nombre: e.target.value } }))} maxLength={60} />
              </Field>
              <IconButton label={`Otra tirada para ${b.publico.nombre || 'este candidato'}`} onClick={() => otraTirada(i)}><RefreshCw size={18} aria-hidden /></IconButton>
              <IconButton label={`Quitar a ${b.publico.nombre || 'este candidato'}`} onClick={() => quitar(i)}><X size={18} aria-hidden /></IconButton>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10 }}>
              <Field label="Oficio">
                <Select value={b.publico.oficio} onChange={(e) => cambiarOficio(i, e.target.value)}>
                  {oficios.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                </Select>
              </Field>
              <Field label="Sueldo por semana" hint={`Sugerido: ${dinero(sueldoSugerido(catalogo, era, b.privado.rango, !!b.privado.nacidoDelMetal))}`}>
                <CampoCantidad valor={sueldos[i] ?? aTexto(b.publico.sueldo)} onCambio={(t) => cambiarSueldo(i, t)} />
              </Field>
            </div>
            <Field label="Facción">
              <Select value={b.publico.faccion ?? ''} onChange={(e) => cambiar(i, (x) => ({ ...x, publico: { ...x.publico, faccion: e.target.value || null } }))}>
                <option value="">Ninguna</option>
                {facciones.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
              </Select>
            </Field>
            <Field label="Rasgo" hint="Lo ven los jugadores.">
              <Input value={b.publico.rasgo} onChange={(e) => cambiar(i, (x) => ({ ...x, publico: { ...x.publico, rasgo: e.target.value } }))} maxLength={120} />
            </Field>
            <div style={{ display: 'grid', gap: 10, paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
              <p style={{ ...textoSuave, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gm)' }}>
                <Lock size={14} aria-hidden /> Solo tú
              </p>
              <div>
                <p style={etiquetaCampo}>Rango</p>
                <Segmented<RangoPnj>
                  ariaLabel={`Rango de ${b.publico.nombre || 'este candidato'}`}
                  value={b.privado.rango}
                  onChange={(rango) => cambiarRango(i, rango)}
                  options={(['secuaz', 'rival', 'jefe'] as const).map((r) => ({ value: r, label: RANGO[r] }))}
                />
              </div>
              {b.privado.nacidoDelMetal && (
                <p style={textoSuave}>
                  Nacido del metal por su oficio: {catalogo.metales?.find((m) => m.id === b.privado.nacidoDelMetal)?.nombre ?? b.privado.nacidoDelMetal}.
                </p>
              )}
              <div>
                <p style={etiquetaCampo}>Lealtad</p>
                <Segmented<number>
                  ariaLabel={`Lealtad de ${b.publico.nombre || 'este candidato'}`}
                  value={b.privado.lealtad}
                  onChange={(lealtad) => cambiar(i, (x) => ({ ...x, privado: { ...x.privado, lealtad } }))}
                  options={[0, 1, 2, 3].map((v) => ({ value: v, label: String(v) }))}
                />
              </div>
              <Field label="Secreto" hint="Nunca llega a los jugadores.">
                <Textarea value={b.secreto} onChange={(e) => cambiar(i, (x) => ({ ...x, secreto: e.target.value }))} rows={2} />
              </Field>
            </div>
          </Card>
        ))}
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}
