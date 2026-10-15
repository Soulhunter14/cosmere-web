/**
 * «Trabajadores» tab: the crew's hired NPCs. Everyone with access sees the public part (name, trade, wage, faction, trait and who hired
 * them), hires among the candidates the director publishes (PanelCandidatos: the only way to hire) and fires; the director also sees and
 * edits the private part (tier, metal, loyalty, state, post, notes and secret), which never reaches a player.
 */
import { useState } from 'react'
import { Lock, Pencil, Trash2, UserMinus, Users } from 'lucide-react'
import {
  Badge, Button, Card, ConfirmDialog, Disclosure, EmptyState, ErrorMessage, Field, IconButton, Input, Segmented, Select, Sheet, Textarea,
} from '../../components/ui'
import { MetalGlyph } from '../../components/mistborn/MetalGlyph'
import { isAvailable } from '../../worlds'
import { textoEra, type CatalogoBanda, type RangoPnj } from '../../lib/banda/tipos'
import type { Era } from '../../types'
import { c, font, fs } from '../../theme'
import {
  nombreActor, type Actor, type BandaEstado, type BandaSecretos, type EstadoTrabajador, type Trabajador, type TrabajadorPrivado,
} from './estado'
import {
  borrarTrabajador, despedir, editarTrabajador, faccionesPropiasDe, guardarSecreto, nombreFaccion, nombreMejora, nombreOficio, privadoDe,
  sueldoSugerido, topeTrabajadores, type DatosContratacion, type OpBanda,
} from './operaciones'
import { ESTADO_TRABAJADOR, RANGO, leerCantidad, textoSuave, useEjecutar } from './etiquetas'
import { CampoCantidad, OrigenChip, Puntos } from './piezas'
import { SeccionCandidatos } from './PanelCandidatos'

interface Props {
  banda: BandaEstado
  secretos: BandaSecretos
  catalogo: CatalogoBanda
  era: Era | null
  /** Director: private data, edit */
  editable: boolean
  /** Director or a player with access: hire and fire */
  puedeActuar: boolean
  actores: Actor[]
  dinero: (v: number) => string
  aplicar: (op: OpBanda) => void
}

export function PanelTrabajadores({ banda, secretos, catalogo, era, editable, puedeActuar, actores, dinero, aplicar }: Props) {
  const [editando, setEditando] = useState<Trabajador | null>(null)
  const [despidiendo, setDespidiendo] = useState<Trabajador | null>(null)
  const [borrando, setBorrando] = useState<Trabajador | null>(null)
  const { error, ejecutar } = useEjecutar(aplicar)

  const actuales = banda.trabajadores.filter((t) => t.enBanda)
  const antiguos = banda.trabajadores.filter((t) => !t.enBanda)
  const tope = topeTrabajadores(banda, catalogo)
  const nomina = actuales.reduce((s, t) => s + t.sueldo, 0)

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <p style={textoSuave}>
          Plazas <strong style={{ color: c.text }}>{actuales.length}/{tope}</strong> (escala {banda.escala}) · Sueldos{' '}
          <strong style={{ color: c.text }}>{dinero(Math.round(nomina * 100) / 100)}</strong> por semana
        </p>
      </div>

      {actuales.length === 0 ? (
        <EmptyState
          icon={<Users size={28} aria-hidden />}
          title="Nadie trabaja aún para la banda"
          description="Barqueros, informantes, falsificadores… Cada uno cobra por semana y trabaja en un puesto del refugio. Se contratan entre los candidatos que publica el director."
        />
      ) : (
        actuales.map((t) => (
          <TarjetaTrabajador
            key={t.id}
            t={t}
            banda={banda}
            faccion={t.faccion ? nombreFaccion(t.faccion, { banda, secretos }, catalogo) : null}
            privado={editable ? privadoDe(t, secretos, catalogo) : null}
            secreto={editable ? secretos.secretos[t.id] : undefined}
            catalogo={catalogo}
            era={era}
            editable={editable}
            puedeActuar={puedeActuar}
            dinero={dinero}
            onEditar={() => setEditando(t)}
            onDespedir={() => setDespidiendo(t)}
          />
        ))
      )}

      <SeccionCandidatos
        banda={banda} secretos={secretos} catalogo={catalogo} era={era} editable={editable} puedeActuar={puedeActuar}
        actores={actores} dinero={dinero} aplicar={aplicar}
      />

      {antiguos.length > 0 && (
        <Disclosure title={`Antiguos (${antiguos.length})`} summary="Ya no están con la banda; siguen en el registro.">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
            {antiguos.map((t) => (
              <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, minWidth: 0, color: c.text }}>
                  {t.nombre} <span style={{ color: c.muted }}>· {nombreOficio(t, catalogo)}</span>
                </span>
                {editable && (
                  <>
                    <Badge tone={ESTADO_TRABAJADOR[privadoDe(t, secretos, catalogo).estado].tono}>{ESTADO_TRABAJADOR[privadoDe(t, secretos, catalogo).estado].label}</Badge>
                    <IconButton label={`Editar ${t.nombre}`} size={36} onClick={() => setEditando(t)}><Pencil size={16} aria-hidden /></IconButton>
                    <IconButton label={`Borrar a ${t.nombre} de la hoja`} size={36} onClick={() => setBorrando(t)}><Trash2 size={16} aria-hidden /></IconButton>
                  </>
                )}
              </li>
            ))}
          </ul>
        </Disclosure>
      )}
      {error && <ErrorMessage message={error} />}

      {editando && (
        <TrabajadorSheet
          key={editando.id}
          trabajador={editando}
          privadoInicial={privadoDe(editando, secretos, catalogo)}
          secreto={secretos.secretos[editando.id] ?? ''}
          banda={banda}
          faccionesPropias={faccionesPropiasDe({ banda, secretos }, catalogo)}
          catalogo={catalogo}
          era={era}
          esDirector={editable}
          dinero={dinero}
          onClose={() => setEditando(null)}
          aplicar={aplicar}
        />
      )}
      <ConfirmDialog
        open={!!despidiendo}
        title={`¿Despedir a ${despidiendo?.nombre ?? ''}?`}
        message="Deja la banda; quedará en el registro."
        confirmLabel="Despedir"
        onConfirm={() => { if (despidiendo) ejecutar(despedir(despidiendo.id, 'Despedido')); setDespidiendo(null) }}
        onCancel={() => setDespidiendo(null)}
      />
      <ConfirmDialog
        open={!!borrando}
        title={`¿Borrar a ${borrando?.nombre ?? ''} de la hoja?`}
        message="Desaparece de la lista de antiguos; el registro conserva sus movimientos."
        confirmLabel="Borrar"
        onConfirm={() => { if (borrando) ejecutar(borrarTrabajador(borrando.id)); setBorrando(null) }}
        onCancel={() => setBorrando(null)}
      />
    </div>
  )
}

function TarjetaTrabajador({ t, banda, faccion, privado, secreto, catalogo, era, editable, puedeActuar, dinero, onEditar, onDespedir }: {
  t: Trabajador
  banda: BandaEstado
  /** Name of their faction, when whoever looks knows it */
  faccion: string | null
  /** Only the director has it */
  privado: TrabajadorPrivado | null
  secreto: string | undefined
  catalogo: CatalogoBanda
  era: Era | null
  /** Director: edit */
  editable: boolean
  /** Director or a player with access: fire */
  puedeActuar: boolean
  dinero: (v: number) => string
  onEditar: () => void
  onDespedir: () => void
}) {
  const oficio = catalogo.oficios.find((o) => o.id === t.oficio)
  const refugio = privado?.puesto ? banda.refugios.find((r) => r.id === privado.puesto?.refugio) : undefined
  const mejora = refugio && privado?.puesto?.mejora ? refugio.mejoras.find((m) => m.id === privado.puesto?.mejora) : undefined
  const metal = privado?.nacidoDelMetal ? catalogo.metales?.find((m) => m.id === privado.nacidoDelMetal) : undefined
  const contratado = nombreActor(t.contratadoPor)

  return (
    <Card padding={16} style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: font.display, fontSize: fs.lg + 1, fontWeight: 600, color: c.text, lineHeight: 1.25 }}>{t.nombre}</h3>
          <p style={{ ...textoSuave, marginTop: 2 }}>
            {nombreOficio(t, catalogo)} · {dinero(t.sueldo)} por semana{faccion ? ` · ${faccion}` : ''}
          </p>
          {t.rasgo && <p style={{ ...textoSuave, fontStyle: 'italic' }}>{t.rasgo}</p>}
          {contratado && <p style={{ ...textoSuave, fontSize: fs.xs }}>Contratado por {contratado}</p>}
        </div>
        {puedeActuar && (
          <div style={{ display: 'flex', gap: 2 }}>
            {editable && <IconButton label={`Editar ${t.nombre}`} onClick={onEditar}><Pencil size={18} aria-hidden /></IconButton>}
            <IconButton label={`Despedir a ${t.nombre}`} onClick={onDespedir}><UserMinus size={18} aria-hidden /></IconButton>
          </div>
        )}
      </div>

      {/* The private part: only the director */}
      {privado && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <Badge tone={ESTADO_TRABAJADOR[privado.estado].tono}>{ESTADO_TRABAJADOR[privado.estado].label}</Badge>
            <Badge tone="cuarzo">{RANGO[privado.rango]}</Badge>
            {metal && (
              <Badge tone="amatista">
                <MetalGlyph metal={metal.id} arte="alomancia" size={14} />
                {metal.nombre}
              </Badge>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: fs.sm, color: c.muted }}>
              Lealtad <Puntos valor={privado.lealtad} max={3} tono={privado.lealtad <= 0 ? 'rubi' : privado.lealtad >= 3 ? 'esmeralda' : 'zafiro'} etiqueta="Lealtad" />
            </span>
          </div>
          <p style={textoSuave}>
            {refugio ? `Puesto: ${refugio.nombre}${mejora ? ` · ${nombreMejora(mejora, catalogo)}` : ''}` : 'Sin puesto en un refugio'}
          </p>
          {oficio?.puesto && <p style={{ ...textoSuave, fontSize: fs.xs }}>{textoEra(oficio.puesto.ventaja, era)}</p>}
          {privado.notas && <p style={{ ...textoSuave, whiteSpace: 'pre-line' }}>{privado.notas}</p>}
          {secreto && (
            <p style={{ ...textoSuave, display: 'flex', gap: 6, alignItems: 'flex-start', color: 'var(--gm)' }}>
              <Lock size={14} aria-hidden style={{ flexShrink: 0, marginTop: 3 }} />
              <span><span className="sr-only">Secreto (solo el director): </span>{secreto}</span>
            </p>
          )}
          {oficio && <div><OrigenChip origen={oficio.origen} /></div>}
        </>
      )}
    </Card>
  )
}

/** Edit a worker (director): the public part and the private one. Hiring is only among candidates (PanelCandidatos) */
function TrabajadorSheet({ trabajador, privadoInicial, secreto, banda, faccionesPropias, catalogo, era, esDirector, dinero, onClose, aplicar }: {
  trabajador: Trabajador
  privadoInicial: TrabajadorPrivado
  secreto: string
  banda: BandaEstado
  /** The director's own factions that whoever hires knows */
  faccionesPropias: { id: string; nombre: string }[]
  catalogo: CatalogoBanda
  era: Era | null
  esDirector: boolean
  dinero: (v: number) => string
  onClose: () => void
  aplicar: (op: OpBanda) => void
}) {
  const oficios = catalogo.oficios.filter((o) => isAvailable(o, era) || o.id === trabajador.oficio)

  const [publico, setPublico] = useState<DatosContratacion>(() => ({
    nombre: trabajador.nombre, oficio: trabajador.oficio, oficioNombre: trabajador.oficioNombre, sueldo: trabajador.sueldo, faccion: trabajador.faccion,
  }))
  const [privado, setPrivado] = useState<TrabajadorPrivado>(privadoInicial)
  // A saved wage stays as it is: only a new trade or tier, once touched by hand, would change it
  const [sueldoTocado, setSueldoTocado] = useState(true)
  // What was typed in the wage (null: it shows the wage, suggested or saved)
  const [sueldoTexto, setSueldoTexto] = useState<string | null>(null)
  const [textoSecreto, setTextoSecreto] = useState(secreto)
  const { error, ejecutar } = useEjecutar(aplicar)
  const oficio = catalogo.oficios.find((o) => o.id === publico.oficio)

  const sugerido = (rango: RangoPnj, metal: string | null) => sueldoSugerido(catalogo, era, rango, !!metal)
  const elegirOficio = (id: string) => {
    const o = catalogo.oficios.find((x) => x.id === id)
    const rango = o?.rango ?? privado.rango
    const metal = o ? (o.metal ?? null) : privado.nacidoDelMetal
    setPrivado((p) => ({ ...p, rango, nacidoDelMetal: metal }))
    setPublico((d) => ({ ...d, oficio: id, ...(sueldoTocado ? {} : { sueldo: sugerido(rango, metal) }) }))
  }
  const cambiarPrivado = (cambio: Partial<TrabajadorPrivado>) => {
    const n = { ...privado, ...cambio }
    setPrivado(n)
    if (!sueldoTocado && (cambio.rango !== undefined || cambio.nacidoDelMetal !== undefined)) setPublico((d) => ({ ...d, sueldo: sugerido(n.rango, n.nacidoDelMetal) }))
  }

  // Posts: each refuge, and each of its upgrades
  const puestos = banda.refugios.flatMap((r) => [
    { valor: `${r.id}|`, label: r.nombre },
    ...r.mejoras.filter((m) => m.mejora !== 'movilidad').map((m) => ({ valor: `${r.id}|${m.id}`, label: `${r.nombre} · ${nombreMejora(m, catalogo)}` })),
  ])
  const puestoActual = privado.puesto ? `${privado.puesto.refugio}|${privado.puesto.mejora ?? ''}` : ''
  const facciones = [...catalogo.facciones.filter((f) => isAvailable(f, era) && !f.enemiga), ...faccionesPropias]

  // The worker and their secret are saved together
  const guardar = () => ejecutar(
    (doc, ctx) => {
      const tras = editarTrabajador(trabajador.id, publico, privado)(doc, ctx)
      return textoSecreto !== secreto ? guardarSecreto(trabajador.id, textoSecreto)(tras, ctx) : tras
    },
    onClose,
  )

  return (
    <Sheet
      open
      onClose={onClose}
      title={`Editar a ${trabajador.nombre}`}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar} disabled={!publico.nombre.trim()}>Guardar</Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <Field label="Nombre">
          <Input value={publico.nombre} onChange={(e) => setPublico((d) => ({ ...d, nombre: e.target.value }))} placeholder="Roben" autoFocus maxLength={60} />
        </Field>
        <Field label="Oficio">
          <Select value={publico.oficio} onChange={(e) => elegirOficio(e.target.value)}>
            {oficios.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            <option value="propio">Otro (oficio propio)</option>
          </Select>
        </Field>
        {publico.oficio === 'propio' && (
          <Field label="Nombre del oficio">
            <Input value={publico.oficioNombre ?? ''} onChange={(e) => setPublico((d) => ({ ...d, oficioNombre: e.target.value }))} placeholder="Cochero" maxLength={40} />
          </Field>
        )}
        {oficio?.puesto && <p style={textoSuave}>{textoEra(oficio.puesto.ventaja, era)}</p>}
        <Field label="Sueldo por semana" hint={`Sugerido: ${dinero(sugerido(privado.rango, privado.nacidoDelMetal))} (casero).`}>
          <CampoCantidad
            valor={sueldoTexto ?? String(publico.sueldo).replace('.', ',')}
            onCambio={(t) => {
              setSueldoTocado(true)
              setSueldoTexto(t)
              const n = leerCantidad(t)
              setPublico((d) => ({ ...d, sueldo: Number.isFinite(n) ? n : 0 }))
            }}
          />
        </Field>
        <Field label="Facción">
          <Select value={publico.faccion ?? ''} onChange={(e) => setPublico((d) => ({ ...d, faccion: e.target.value || null }))}>
            <option value="">Ninguna</option>
            {facciones.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
          </Select>
        </Field>

        {esDirector && (
          <div style={{ display: 'grid', gap: 14, paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
            <p style={{ ...textoSuave, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gm)' }}>
              <Lock size={14} aria-hidden /> Datos privados: solo los ves tú
            </p>
            <div>
              <p style={{ fontSize: fs.sm, fontWeight: 650, color: c.text, marginBottom: 6 }}>Rango</p>
              <Segmented<RangoPnj>
                ariaLabel="Rango"
                value={privado.rango}
                onChange={(rango) => cambiarPrivado({ rango })}
                options={(['secuaz', 'rival', 'jefe'] as const).map((r) => ({ value: r, label: RANGO[r] }))}
              />
            </div>
            {catalogo.metales && (
              <Field label="Nacido del metal">
                <Select value={privado.nacidoDelMetal ?? ''} onChange={(e) => cambiarPrivado({ nacidoDelMetal: e.target.value || null })}>
                  <option value="">No</option>
                  {catalogo.metales.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </Select>
              </Field>
            )}
            <div>
              <p style={{ fontSize: fs.sm, fontWeight: 650, color: c.text, marginBottom: 6 }}>Lealtad</p>
              <Segmented<number>
                ariaLabel="Lealtad"
                value={privado.lealtad}
                onChange={(lealtad) => cambiarPrivado({ lealtad })}
                options={[0, 1, 2, 3].map((v) => ({ value: v, label: String(v) }))}
              />
              <p style={{ ...textoSuave, fontSize: fs.xs, marginTop: 4 }}>0: a punto de irse · 1: contratado · 2: de confianza · 3: leal.</p>
            </div>
            <Field label="Estado">
              <Select value={privado.estado} onChange={(e) => cambiarPrivado({ estado: e.target.value as EstadoTrabajador })}>
                {(Object.keys(ESTADO_TRABAJADOR) as EstadoTrabajador[]).map((k) => <option key={k} value={k}>{ESTADO_TRABAJADOR[k].label}</option>)}
              </Select>
            </Field>
            <Field label="Puesto">
              <Select
                value={puestoActual}
                onChange={(e) => {
                  const [refugio, mejora] = e.target.value.split('|')
                  cambiarPrivado({ puesto: refugio ? { refugio, mejora: mejora || null } : null })
                }}
              >
                <option value="">Sin puesto</option>
                {puestos.map((p) => <option key={p.valor} value={p.valor}>{p.label}</option>)}
              </Select>
            </Field>
            <Field label="Notas">
              <Textarea value={privado.notas} onChange={(e) => cambiarPrivado({ notas: e.target.value })} rows={3} />
            </Field>
            <Field label="Secreto" hint="Nunca llega a los jugadores.">
              <Textarea value={textoSecreto} onChange={(e) => setTextoSecreto(e.target.value)} rows={2} placeholder="Informa al enemigo a cambio de su hermano." />
            </Field>
          </div>
        )}
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}
