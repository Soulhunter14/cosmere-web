/**
 * «Refugio» tab: the crew's refuges, their upgrades (official and our own) and the workers posted in each. The director manages
 * everything; a player with access builds upgrades and cancels works in progress as their character.
 */
import { useState } from 'react'
import { AlertTriangle, Ban, Check, Hammer, Pencil, Plus, Trash2, Warehouse, Wrench } from 'lucide-react'
import {
  Badge, Button, Card, ConfirmDialog, Disclosure, EmptyState, ErrorMessage, Field, IconButton, Input, Segmented, Select, Sheet, Switch, Textarea,
} from '../../components/ui'
import { isAvailable } from '../../worlds'
import { enEra, textoEra, type CatalogoBanda } from '../../lib/banda/tipos'
import type { Era } from '../../types'
import { c, font, fs, radius } from '../../theme'
import { nombreActor, type Actor, type BandaEstado, type BandaSecretos, type EstadoRefugio, type MejoraRefugio, type Refugio } from './estado'
import {
  cancelarObra, capacidadUsada, construirMejora, costeReparacion, danarMejora, devolucionObra, guardarRefugio, nombreMejora, privadoDe, quitarMejora,
  quitarRefugio, semanasReparacion,
  repararMejora, terminarObra, type DatosRefugio, type OpBanda,
} from './operaciones'
import { ESTADO_MEJORA, ESTADO_REFUGIO, textoSuave, useEjecutar } from './etiquetas'
import { SelectorActor, TextoRegla } from './piezas'

interface Props {
  banda: BandaEstado
  secretos: BandaSecretos
  catalogo: CatalogoBanda
  era: Era | null
  /** Director: refuges and every upgrade action */
  editable: boolean
  /** Director or a player with access: build upgrades and cancel works */
  puedeActuar: boolean
  actores: Actor[]
  dinero: (v: number) => string
  aplicar: (op: OpBanda) => void
}

export function PanelRefugio({ banda, secretos, catalogo, era, editable, puedeActuar, actores, dinero, aplicar }: Props) {
  const [editando, setEditando] = useState<Refugio | 'nuevo' | null>(null)
  const [construyendo, setConstruyendo] = useState<Refugio | null>(null)
  const [cancelando, setCancelando] = useState<{ refugio: Refugio; mejora: MejoraRefugio } | null>(null)
  const refugios = [...banda.refugios].sort((a, b) => Number(b.principal) - Number(a.principal))

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {refugios.length === 0 ? (
        <EmptyState
          icon={<Warehouse size={28} aria-hidden />}
          title="La banda aún no tiene refugio"
          description="Un escondite donde descansar, planear y guardar lo robado. Llega como recompensa o se consigue en un encargo."
          action={editable ? <Button icon={<Plus size={16} aria-hidden />} onClick={() => setEditando('nuevo')}>Añadir refugio</Button> : undefined}
        />
      ) : (
        <>
          {refugios.map((r) => (
            <TarjetaRefugio
              key={r.id}
              refugio={r}
              banda={banda}
              secretos={secretos}
              catalogo={catalogo}
              era={era}
              editable={editable}
              puedeActuar={puedeActuar}
              dinero={dinero}
              aplicar={aplicar}
              onEditar={() => setEditando(r)}
              onConstruir={() => setConstruyendo(r)}
              onCancelar={(mejora) => setCancelando({ refugio: r, mejora })}
            />
          ))}
          {editable && (
            <div>
              <Button variant="secondary" icon={<Plus size={16} aria-hidden />} onClick={() => setEditando('nuevo')}>Añadir refugio</Button>
            </div>
          )}
        </>
      )}

      {catalogo.reglasRefugio.length > 0 && (
        <Disclosure title="Cómo funcionan los refugios">
          <div style={{ display: 'grid', gap: 14 }}>
            {catalogo.reglasRefugio.map((r) => (
              <div key={r.titulo} style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontWeight: 650, color: c.text }}>{r.titulo}</span>
                <TextoRegla texto={r.texto} casero={r.casero} origen={r.origen} cita={r.cita} era={era} />
              </div>
            ))}
          </div>
        </Disclosure>
      )}

      {editando && (
        <RefugioSheet
          key={editando === 'nuevo' ? 'nuevo' : editando.id}
          refugio={editando === 'nuevo' ? null : editando}
          catalogo={catalogo}
          era={era}
          onClose={() => setEditando(null)}
          aplicar={aplicar}
        />
      )}
      {construyendo && (
        <MejoraSheet
          key={construyendo.id}
          refugio={construyendo}
          banda={banda}
          catalogo={catalogo}
          era={era}
          esDirector={editable}
          actores={actores}
          dinero={dinero}
          onClose={() => setConstruyendo(null)}
          aplicar={aplicar}
        />
      )}
      {cancelando && (
        <CancelarObraSheet
          key={cancelando.mejora.id}
          refugio={cancelando.refugio}
          mejora={cancelando.mejora}
          catalogo={catalogo}
          esDirector={editable}
          actores={actores}
          dinero={dinero}
          onClose={() => setCancelando(null)}
          aplicar={aplicar}
        />
      )}
    </div>
  )
}

function TarjetaRefugio({ refugio, banda, secretos, catalogo, era, editable, puedeActuar, dinero, aplicar, onEditar, onConstruir, onCancelar }: {
  refugio: Refugio
  banda: BandaEstado
  secretos: BandaSecretos
  catalogo: CatalogoBanda
  era: Era | null
  editable: boolean
  puedeActuar: boolean
  dinero: (v: number) => string
  aplicar: (op: OpBanda) => void
  onEditar: () => void
  onConstruir: () => void
  onCancelar: (m: MejoraRefugio) => void
}) {
  const tipo = catalogo.tiposRefugio.find((t) => t.id === refugio.tipo)
  const estado = ESTADO_REFUGIO[refugio.estado]
  const usada = capacidadUsada(refugio)
  const capacidad = tipo?.capacidad ?? 0
  // Posts are private: only the director sees who works where
  const trabajadores = editable
    ? banda.trabajadores.filter((t) => t.enBanda && privadoDe(t, secretos, catalogo).puesto?.refugio === refugio.id)
    : []

  return (
    <Card padding={16} style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: font.display, fontSize: fs.lg + 1, fontWeight: 600, color: c.text, lineHeight: 1.25 }}>{refugio.nombre}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {refugio.principal && <Badge tone="gold">Principal</Badge>}
            <Badge tone="cuarzo">{tipo?.nombre ?? refugio.tipo}</Badge>
            <Badge tone={estado.tono}>{estado.label}</Badge>
          </div>
          {refugio.ubicacion && <p style={{ ...textoSuave, marginTop: 6 }}>{refugio.ubicacion}</p>}
        </div>
        {editable && <IconButton label={`Editar ${refugio.nombre}`} onClick={onEditar}><Pencil size={18} aria-hidden /></IconButton>}
      </div>

      {tipo && (
        <TextoRegla texto={tipo.notas} casero={tipo.casero} origen={tipo.origen} cita={tipo.cita} era={era} conFuente={tipo.origen !== 'casero'} />
      )}
      {refugio.notas && <p style={{ ...textoSuave, whiteSpace: 'pre-line' }}>{refugio.notas}</p>}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: fs.sm, fontWeight: 650, color: c.text }}>Mejoras · {usada}/{capacidad}</span>
          {puedeActuar && refugio.estado !== 'perdido' && (
            <Button size="sm" variant="secondary" icon={<Hammer size={15} aria-hidden />} onClick={onConstruir}>Construir mejora</Button>
          )}
        </div>
        {refugio.mejoras.length === 0 ? (
          <p style={textoSuave}>Sin mejoras: un escondite con lo justo.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
            {refugio.mejoras.map((m) => (
              <FilaMejora
                key={m.id}
                refugio={refugio}
                mejora={m}
                catalogo={catalogo}
                era={era}
                editable={editable}
                puedeActuar={puedeActuar}
                dinero={dinero}
                aplicar={aplicar}
                onCancelar={() => onCancelar(m)}
              />
            ))}
          </ul>
        )}
      </div>

      {trabajadores.length > 0 && (
        <p style={textoSuave}>
          <span style={{ fontWeight: 650, color: c.text }}>Trabajan aquí: </span>
          {trabajadores.map((t) => t.nombre).join(', ')}
        </p>
      )}
    </Card>
  )
}

function FilaMejora({ refugio, mejora, catalogo, era, editable, puedeActuar, dinero, aplicar, onCancelar }: {
  refugio: Refugio
  mejora: MejoraRefugio
  catalogo: CatalogoBanda
  era: Era | null
  editable: boolean
  puedeActuar: boolean
  dinero: (v: number) => string
  aplicar: (op: OpBanda) => void
  onCancelar: () => void
}) {
  const [confirmar, setConfirmar] = useState<'quitar' | 'danar' | null>(null)
  const { error, ejecutar } = useEjecutar(aplicar)
  const def = catalogo.mejorasRefugio.find((d) => d.id === mejora.mejora)
  const estado = ESTADO_MEJORA[mejora.estado]
  const nombre = nombreMejora(mejora, catalogo)
  // Repairing (our rules): half its price and half its weeks of work, rounded up
  const reparacion = costeReparacion(mejora, catalogo, era)
  const semanasRep = semanasReparacion(mejora, catalogo)
  const repara = !!mejora.reparacion
  const quien = nombreActor(mejora.aplicadaPor)

  return (
    <li style={{ padding: '10px 12px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`, display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontWeight: 650, color: c.text, marginRight: 4 }}>
          {nombre}{def && def.coste.length > 1 ? ` · nivel ${mejora.nivel}` : ''}
        </span>
        <Badge tone={estado.tono}>
          {repara ? 'En reparación' : estado.label}{mejora.estado === 'en-obra' ? ` · ${mejora.semanasRestantes} de ${mejora.semanasTotales} ${mejora.semanasTotales === 1 ? 'semana' : 'semanas'}` : ''}
        </Badge>
      </div>
      {mejora.mejora === 'propia' ? (
        <TextoRegla texto={mejora.efecto ?? ''} origen="casero" era={era} />
      ) : def ? (
        <TextoRegla texto={def.efecto} casero={def.casero} origen={def.origen} cita={def.cita} era={era} />
      ) : null}
      {(quien || mejora.coste > 0) && (
        <p style={{ ...textoSuave, fontSize: fs.xs }}>
          {quien ? `Aplicada por ${quien}` : 'Aplicada'}{mejora.coste > 0 ? ` · costó ${dinero(mejora.coste)}` : mejora.aplicadaPor ? ' · recompensa' : ''}
        </p>
      )}
      {(editable || (puedeActuar && mejora.estado === 'en-obra')) && mejora.mejora !== 'movilidad' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {editable && mejora.estado === 'en-obra' && (
            <Button size="sm" variant="secondary" icon={<Check size={15} aria-hidden />} onClick={() => ejecutar(terminarObra(refugio.id, mejora.id))}>{repara ? 'Reparación terminada' : 'Obra terminada'}</Button>
          )}
          {mejora.estado === 'en-obra' && (
            <Button size="sm" variant="ghost" icon={<Ban size={15} aria-hidden />} onClick={onCancelar}>
              {repara ? 'Cancelar reparación' : 'Cancelar obra'}{devolucionObra(mejora) > 0 ? ` (devuelve ${dinero(devolucionObra(mejora))})` : ''}
            </Button>
          )}
          {editable && mejora.estado === 'lista' && (
            <Button size="sm" variant="ghost" icon={<AlertTriangle size={15} aria-hidden />} onClick={() => setConfirmar('danar')}>Dañada</Button>
          )}
          {editable && mejora.estado === 'danada' && (
            <Button size="sm" variant="secondary" icon={<Wrench size={15} aria-hidden />} onClick={() => ejecutar(repararMejora(refugio.id, mejora.id, false))}>
              Reparar{reparacion || semanasRep ? ` (${[reparacion ? dinero(reparacion) : '', semanasRep ? `${semanasRep} ${semanasRep === 1 ? 'semana' : 'semanas'}` : ''].filter(Boolean).join(' · ')})` : ''}
            </Button>
          )}
          {editable && mejora.estado !== 'en-obra' && (
            <Button size="sm" variant="ghost" icon={<Trash2 size={15} aria-hidden />} onClick={() => setConfirmar('quitar')}>Quitar</Button>
          )}
        </div>
      )}
      {error && <ErrorMessage message={error} />}
      <ConfirmDialog
        open={confirmar === 'quitar'}
        title={`¿Quitar ${nombre}?`}
        message="No se devuelve el dinero."
        confirmLabel="Quitar"
        onConfirm={() => { ejecutar(quitarMejora(refugio.id, mejora.id)); setConfirmar(null) }}
        onCancel={() => setConfirmar(null)}
      />
      <ConfirmDialog
        open={confirmar === 'danar'}
        title={`¿Marcar ${nombre} como dañada?`}
        message={`No da su efecto hasta repararla${reparacion ? `, por ${dinero(reparacion)}` : ''}${semanasRep ? ` y en ${semanasRep} ${semanasRep === 1 ? 'semana' : 'semanas'}` : ''}. Si vuelve a dañarse, se rompe y se pierde.`}
        confirmLabel="Marcar dañada"
        tone="brand"
        onConfirm={() => { ejecutar(danarMejora(refugio.id, mejora.id, 'Dañada')); setConfirmar(null) }}
        onCancel={() => setConfirmar(null)}
      />
    </li>
  )
}

/** Cancelling a work in progress: who does it, and the refund of the weeks still left */
function CancelarObraSheet({ refugio, mejora, catalogo, esDirector, actores, dinero, onClose, aplicar }: {
  refugio: Refugio
  mejora: MejoraRefugio
  catalogo: CatalogoBanda
  esDirector: boolean
  actores: Actor[]
  dinero: (v: number) => string
  onClose: () => void
  aplicar: (op: OpBanda) => void
}) {
  const opciones = actores.filter((a) => esDirector || a.tipo === 'pj')
  const [actor, setActor] = useState<Actor | null>(opciones.length === 1 ? opciones[0] : null)
  const { error, ejecutar } = useEjecutar(aplicar)
  const devolucion = devolucionObra(mejora)
  const nombre = nombreMejora(mejora, catalogo)
  const repara = !!mejora.reparacion
  const pagado = mejora.reparacion ? mejora.reparacion.coste : mejora.coste
  return (
    <Sheet
      open
      onClose={onClose}
      title={repara ? `¿Cancelar la reparación de ${nombre}?` : `¿Cancelar la obra de ${nombre}?`}
      description={`En ${refugio.nombre}. Faltan ${mejora.semanasRestantes} de ${mejora.semanasTotales} semanas.`}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>No cancelar</Button>
          <Button variant="danger" onClick={() => ejecutar(cancelarObra(refugio.id, mejora.id, actor), onClose)}>{repara ? 'Cancelar la reparación' : 'Cancelar la obra'}</Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <p style={textoSuave}>
          {devolucion > 0
            ? `Se devuelven ${dinero(devolucion)} a la tesorería: la parte de ${dinero(pagado)} que corresponde a las semanas que faltan.`
            : repara ? 'No se devuelve nada: la reparación no costó nada o ya no le quedan semanas.' : 'No se devuelve nada: fue una recompensa o ya no le quedan semanas.'}
          {repara ? ' La mejora sigue dañada.' : mejora.nivel > 1 ? ' La mejora vuelve a su nivel anterior.' : ' La mejora desaparece del refugio.'}
        </p>
        <SelectorActor actores={opciones} valor={actor} onChange={setActor} conDirector={esDirector} etiqueta="¿Quién la cancela?" />
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

function RefugioSheet({ refugio, catalogo, era, onClose, aplicar }: {
  refugio: Refugio | null
  catalogo: CatalogoBanda
  era: Era | null
  onClose: () => void
  aplicar: (op: OpBanda) => void
}) {
  const tipos = catalogo.tiposRefugio.filter((t) => isAvailable(t, era) || t.id === refugio?.tipo)
  const [datos, setDatos] = useState<DatosRefugio>(() => refugio
    ? { id: refugio.id, tipo: refugio.tipo, nombre: refugio.nombre, ubicacion: refugio.ubicacion, principal: refugio.principal, estado: refugio.estado, notas: refugio.notas }
    : { tipo: tipos[0]?.id ?? 'basico', nombre: '', ubicacion: '', principal: false, estado: 'seguro', notas: '' })
  const [borrar, setBorrar] = useState(false)
  const { error, ejecutar } = useEjecutar(aplicar)
  const tipo = catalogo.tiposRefugio.find((t) => t.id === datos.tipo)
  const set = (cambio: Partial<DatosRefugio>) => setDatos((d) => ({ ...d, ...cambio }))
  const mantenimiento = tipo ? enEra(tipo.mantenimiento, era) : null

  return (
    <Sheet
      open
      onClose={onClose}
      title={refugio ? `Editar ${refugio.nombre}` : 'Nuevo refugio'}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {refugio && <Button variant="ghost" icon={<Trash2 size={15} aria-hidden />} onClick={() => setBorrar(true)}>Borrar</Button>}
          <span style={{ flex: 1 }} />
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => ejecutar(guardarRefugio(datos), onClose)} disabled={!datos.nombre.trim()}>Guardar</Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <Field label="Nombre">
          <Input value={datos.nombre} onChange={(e) => set({ nombre: e.target.value })} placeholder="La Garza" autoFocus maxLength={80} />
        </Field>
        <Field label="Tipo">
          <Select value={datos.tipo} onChange={(e) => set({ tipo: e.target.value })}>
            {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </Select>
        </Field>
        {tipo && (
          <p style={textoSuave}>
            {textoEra(tipo.notas, era)} Caben {tipo.capacidad} mejoras{mantenimiento !== null ? `; mantenimiento ${mantenimiento} por semana` : ''}.
          </p>
        )}
        <Field label="Ubicación">
          <Input value={datos.ubicacion} onChange={(e) => set({ ubicacion: e.target.value })} placeholder="Un muelle olvidado del canal" maxLength={120} />
        </Field>
        {refugio && (
          <div>
            <p style={{ fontSize: fs.sm, fontWeight: 650, color: c.text, marginBottom: 6 }}>Estado</p>
            <Segmented<EstadoRefugio>
              ariaLabel="Estado del refugio"
              value={datos.estado}
              onChange={(estado) => set({ estado })}
              options={(Object.keys(ESTADO_REFUGIO) as EstadoRefugio[]).map((k) => ({ value: k, label: ESTADO_REFUGIO[k].label }))}
            />
          </div>
        )}
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: fs.base, color: c.text }}>Refugio principal (donde vive la banda)</span>
          <Switch checked={datos.principal} onChange={(principal) => set({ principal })} label="Refugio principal" />
        </label>
        <Field label="Notas">
          <Textarea value={datos.notas} onChange={(e) => set({ notas: e.target.value })} rows={3} />
        </Field>
        {error && <ErrorMessage message={error} />}
      </div>
      {refugio && (
        <ConfirmDialog
          open={borrar}
          title={`¿Borrar el refugio ${refugio.nombre}?`}
          message="Sus mejoras se pierden y quien trabajaba allí se queda sin puesto."
          confirmLabel="Borrar"
          onConfirm={() => { ejecutar(quitarRefugio(refugio.id), onClose); setBorrar(false) }}
          onCancel={() => setBorrar(false)}
        />
      )}
    </Sheet>
  )
}

function MejoraSheet({ refugio, banda, catalogo, era, esDirector, actores, dinero, onClose, aplicar }: {
  refugio: Refugio
  banda: BandaEstado
  catalogo: CatalogoBanda
  era: Era | null
  esDirector: boolean
  actores: Actor[]
  dinero: (v: number) => string
  onClose: () => void
  aplicar: (op: OpBanda) => void
}) {
  // Upgrades that can still be added here: not built yet, or Mobiliario selecto below its top level; Movilidad comes with the vehicle
  const disponibles = catalogo.mejorasRefugio.filter((d) => {
    if (!isAvailable(d, era) || d.coste.length === 0) return false
    const hecha = refugio.mejoras.find((m) => m.mejora === d.id)
    return !hecha || (hecha.estado !== 'en-obra' && hecha.nivel < d.coste.length)
  })
  const opcionesActor = actores.filter((a) => esDirector || a.tipo === 'pj')
  const [mejoraId, setMejoraId] = useState(disponibles[0]?.id ?? 'propia')
  const [actor, setActor] = useState<Actor | null>(opcionesActor.length === 1 ? opcionesActor[0] : null)
  const [gratis, setGratis] = useState(false)
  const [yaHecha, setYaHecha] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [nombre, setNombre] = useState('')
  const [efecto, setEfecto] = useState('')
  const { error, ejecutar } = useEjecutar(aplicar)

  const def = catalogo.mejorasRefugio.find((d) => d.id === mejoraId)
  const nivel = (refugio.mejoras.find((m) => m.mejora === mejoraId)?.nivel ?? 0) + 1
  const precio = def ? enEra(def.coste[nivel - 1], era) : null
  const oficiales = disponibles.filter((d) => d.origen !== 'casero')
  const caseras = disponibles.filter((d) => d.origen === 'casero')
  const requisito = def?.requiereOficio ? catalogo.oficios.find((o) => o.id === def.requiereOficio)?.nombre : null
  // Only the director gives upgrades as rewards, adds them already built or invents his own
  const esPropia = esDirector && mejoraId === 'propia'
  const sinPagar = esPropia || (esDirector && gratis)

  const etiqueta = sinPagar ? 'Añadir mejora' : `Pagar ${precio !== null ? dinero(precio) : ''} y empezar`
  const guardar = () => ejecutar(
    construirMejora(refugio.id, mejoraId, { gratis: sinPagar, yaHecha: esDirector && yaHecha, motivo, nombre, efecto, actor }),
    onClose,
  )

  return (
    <Sheet
      open
      onClose={onClose}
      title={`Construir en ${refugio.nombre}`}
      description={`Tesorería: ${dinero(banda.tesoreria)} · Mejoras ${capacidadUsada(refugio)}/${catalogo.tiposRefugio.find((t) => t.id === refugio.tipo)?.capacidad ?? 0}`}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar} disabled={(esPropia && !nombre.trim()) || (!esDirector && disponibles.length === 0)}>{etiqueta}</Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <Field label="Mejora">
          <Select value={mejoraId} onChange={(e) => setMejoraId(e.target.value)}>
            {oficiales.length > 0 && (
              <optgroup label="Del Manual">
                {oficiales.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </optgroup>
            )}
            {caseras.length > 0 && (
              <optgroup label="Caseras">
                {caseras.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </optgroup>
            )}
            {esDirector && <option value="propia">Otra (mejora propia)</option>}
          </Select>
        </Field>

        {def && (
          <div style={{ padding: 12, borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`, display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {def.coste.length > 1 && <Badge tone="cuarzo">Nivel {nivel}</Badge>}
              {precio !== null && <Badge tone="gold">{dinero(precio)}</Badge>}
              {def.semanas > 0 && <Badge tone="topacio">{def.semanas} {def.semanas === 1 ? 'semana' : 'semanas'} de obra</Badge>}
            </div>
            <TextoRegla texto={def.efecto} casero={def.casero} origen={def.origen} cita={def.cita} era={era} />
            {requisito && <p style={{ ...textoSuave, fontSize: fs.xs }}>Necesita un trabajador {requisito.toLowerCase()} en su puesto para funcionar.</p>}
          </div>
        )}

        {esPropia ? (
          <>
            <Field label="Nombre de la mejora">
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Palomar" maxLength={60} />
            </Field>
            <Field label="Efecto">
              <Textarea value={efecto} onChange={(e) => setEfecto(e.target.value)} rows={3} placeholder="Qué permite, pactado con la mesa." />
            </Field>
          </>
        ) : esDirector ? (
          <>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: fs.base, color: c.text }}>Es una recompensa (no se paga)</span>
              <Switch checked={gratis} onChange={setGratis} label="Es una recompensa" />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: fs.base, color: c.text }}>Ya está construida (sin semanas de obra)</span>
              <Switch checked={yaHecha} onChange={setYaHecha} label="Ya está construida" />
            </label>
          </>
        ) : null}
        <SelectorActor actores={opcionesActor} valor={actor} onChange={setActor} conDirector={esDirector} etiqueta="¿Quién la aplica?" />
        <Field label="Motivo" hint="Opcional; queda en el registro.">
          <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder={gratis ? 'Meta de banda: Refugio' : 'Reformas tras el encargo'} maxLength={120} />
        </Field>
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}
