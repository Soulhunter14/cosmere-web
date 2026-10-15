/**
 * «Contactos» tab: reputation with each faction of the era and the crew's contacts (allies, sponsors, companions). The director sees
 * every faction with its real value and decides which ones the players see (hidden by default; or shown without its name, «Alguien»);
 * a player only sees what the director showed.
 */
import { useState, type ReactNode } from 'react'
import { CircleHelp, Eye, EyeOff, Handshake, Lock, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  Badge, Button, Card, ConfirmDialog, EmptyState, ErrorMessage, Field, IconButton, Input, SectionTitle, Segmented, Select, Sheet, Textarea,
} from '../../components/ui'
import { isAvailable } from '../../worlds'
import type { CatalogoBanda, Definicion } from '../../lib/banda/tipos'
import type { Era } from '../../types'
import { c, font, fs, radius } from '../../theme'
import {
  nuevoId, secretosVacios, type BandaEstado, type BandaSecretos, type Contacto, type PapelContacto, type Relacion, type ReputacionConocida,
} from './estado'
import {
  ALGUIEN, anadirFaccion, fijarReputacion, fijarVisibilidad, guardarContacto, guardarSecreto, modoVisibilidad, nombreFaccion, quitarContacto,
  valorReputacion, type DatosContacto, type ModoVisibilidad, type OpBanda,
} from './operaciones'
import { PAPEL, RELACION, conSigno, textoSuave, tonoReputacion, useEjecutar } from './etiquetas'
import { TextoRegla } from './piezas'

interface Props {
  banda: BandaEstado
  secretos: BandaSecretos | null
  catalogo: CatalogoBanda
  era: Era | null
  editable: boolean
  aplicar: (op: OpBanda) => void
}

export function PanelContactos({ banda, secretos, catalogo, era, editable, aplicar }: Props) {
  const [editando, setEditando] = useState<Contacto | 'nuevo' | null>(null)
  const [borrando, setBorrando] = useState<Contacto | null>(null)
  const [faccionNueva, setFaccionNueva] = useState('')
  // A change of reputation waits for confirmation, so a stray tap never moves it
  const [pendiente, setPendiente] = useState<{ id: string; nombre: string; de: number; a: number; modo: ModoVisibilidad } | null>(null)
  const [motivoReputacion, setMotivoReputacion] = useState('')
  const { error, ejecutar } = useEjecutar(aplicar)

  // Only the director has the private part: the factions and their real values
  const doc = { banda, secretos: secretos ?? secretosVacios() }
  const facciones = secretos
    ? [
      ...catalogo.facciones.filter((f) => isAvailable(f, era)).map((f) => ({ id: f.id, nombre: f.nombre, enemiga: !!f.enemiga })),
      ...secretos.faccionesPropias.map((f) => ({ ...f, enemiga: false })),
    ]
    : []
  // Contacts in the order of the ladder: loyal first, hostile last
  const orden: Relacion[] = ['leal', 'aliada', 'neutral', 'tensa', 'hostil']
  const contactos = [...banda.contactos].sort((a, b) => orden.indexOf(a.relacion) - orden.indexOf(b.relacion) || a.nombre.localeCompare(b.nombre))

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <section>
        <SectionTitle as="h3">Reputación</SectionTitle>
        {secretos ? (
          <>
            <p style={{ ...textoSuave, marginBottom: 10 }}>
              Cómo ve a la banda cada facción, de −2 a +2. Con +1 ofrece un candidato más y descuentos; con −2 actúa contra la banda (casero).
              Los jugadores solo ven las que muestres; «Sin nombre» les dice que alguien os ve así, pero no quién.
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
              {facciones.map((f) => {
                const valor = valorReputacion(f.id, secretos, catalogo)
                const modo = modoVisibilidad(f.id, secretos)
                return (
                  <li key={f.id} style={fila}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontWeight: 600, color: c.text }}>{f.nombre}</span>
                      {(!editable || f.enemiga) && <Badge tone={tonoReputacion(valor)}>{f.enemiga ? 'Enemiga · −2' : conSigno(valor)}</Badge>}
                    </div>
                    {editable && !f.enemiga && (
                      <Segmented<number>
                        size="sm"
                        ariaLabel={`Reputación con ${f.nombre}`}
                        value={valor}
                        onChange={(v) => { setMotivoReputacion(''); setPendiente({ id: f.id, nombre: f.nombre, de: valor, a: v, modo }) }}
                        options={[-2, -1, 0, 1, 2].map((v) => ({ value: v, label: conSigno(v) }))}
                      />
                    )}
                    {editable && (
                      <Segmented<ModoVisibilidad>
                        size="sm"
                        tone="cuarzo"
                        ariaLabel={`Qué ven los jugadores de ${f.nombre}`}
                        value={modo}
                        onChange={(m) => ejecutar(fijarVisibilidad(f.id, m))}
                        options={(Object.keys(VISIBILIDAD) as ModoVisibilidad[]).map((m) => ({ value: m, label: VISIBILIDAD[m].label }))}
                      />
                    )}
                    <LoQueVen modo={modo} nombre={f.nombre} valor={valor} />
                  </li>
                )
              })}
            </ul>
          </>
        ) : (
          <>
            <p style={{ ...textoSuave, marginBottom: 10 }}>Lo que sabéis de cómo os ven las facciones, de −2 a +2.</p>
            {banda.reputacionConocida.length === 0 ? (
              <p style={textoSuave}>Aún no sabéis qué piensan de vosotros.</p>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                {banda.reputacionConocida.map((f) => <FilaConocida key={f.id} f={f} />)}
              </ul>
            )}
          </>
        )}
        {editable && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'flex-end' }}>
            <Field label="Otra facción" style={{ flex: 1 }}>
              <Input value={faccionNueva} onChange={(e) => setFaccionNueva(e.target.value)} placeholder="Los Hijos de la Ceniza" maxLength={60} />
            </Field>
            <Button
              variant="secondary"
              icon={<Plus size={15} aria-hidden />}
              disabled={!faccionNueva.trim()}
              onClick={() => ejecutar(anadirFaccion(faccionNueva), () => setFaccionNueva(''))}
            >
              Añadir
            </Button>
          </div>
        )}
      </section>

      <section>
        <SectionTitle as="h3" action={editable ? <Button size="sm" icon={<Plus size={15} aria-hidden />} onClick={() => setEditando('nuevo')}>Nuevo contacto</Button> : undefined}>
          Contactos
        </SectionTitle>
        {contactos.length === 0 ? (
          <EmptyState
            icon={<Handshake size={28} aria-hidden />}
            title="Sin contactos todavía"
            description="Gente con la que la banda tiene trato: de hostil a leal. Los leales pueden ser compañeros, patrocinadores o trabajadores."
          />
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {contactos.map((ct) => {
              const rel = RELACION[ct.relacion]
              const secreto = secretos?.secretos[ct.id]
              // A player does not see the name of a director's own faction until it is shown with its name
              const faccion = ct.faccion ? nombreFaccion(ct.faccion, doc, catalogo) : null
              return (
                <Card key={ct.id} padding={14} style={{ display: 'grid', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, color: c.text, lineHeight: 1.25 }}>{ct.nombre}</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        <Badge tone={rel.tono}>{rel.label}</Badge>
                        {ct.papel !== 'contacto' && <Badge tone="gold">{PAPEL[ct.papel]}</Badge>}
                        {faccion && <Badge tone="cuarzo">{faccion}</Badge>}
                      </div>
                    </div>
                    {editable && (
                      <div style={{ display: 'flex', gap: 2 }}>
                        <IconButton label={`Editar ${ct.nombre}`} onClick={() => setEditando(ct)}><Pencil size={18} aria-hidden /></IconButton>
                        <IconButton label={`Borrar a ${ct.nombre}`} onClick={() => setBorrando(ct)}><Trash2 size={18} aria-hidden /></IconButton>
                      </div>
                    )}
                  </div>
                  {ct.beneficio && <p style={textoSuave}><strong style={{ color: c.text }}>Ofrece:</strong> {ct.beneficio}</p>}
                  {ct.notas && <p style={{ ...textoSuave, whiteSpace: 'pre-line' }}>{ct.notas}</p>}
                  {secreto && (
                    <p style={{ ...textoSuave, display: 'flex', gap: 6, alignItems: 'flex-start', color: 'var(--gm)' }}>
                      <Lock size={14} aria-hidden style={{ flexShrink: 0, marginTop: 3 }} />
                      <span><span className="sr-only">Secreto (solo el director): </span>{secreto}</span>
                    </p>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </section>
      {error && <ErrorMessage message={error} />}

      {editando && (
        <ContactoSheet
          key={editando === 'nuevo' ? 'nuevo' : editando.id}
          contacto={editando === 'nuevo' ? null : editando}
          secreto={editando === 'nuevo' ? '' : (secretos?.secretos[editando.id] ?? '')}
          facciones={facciones}
          patrocinador={catalogo.patrocinador}
          era={era}
          onClose={() => setEditando(null)}
          aplicar={aplicar}
        />
      )}
      <ConfirmDialog
        open={!!borrando}
        title={`¿Borrar el contacto ${borrando?.nombre ?? ''}?`}
        confirmLabel="Borrar"
        onConfirm={() => { if (borrando) ejecutar(quitarContacto(borrando.id)); setBorrando(null) }}
        onCancel={() => setBorrando(null)}
      />
      {pendiente && (
        <Sheet
          open
          onClose={() => setPendiente(null)}
          title="¿Cambiar la reputación?"
          description={`${pendiente.nombre}: de ${conSigno(pendiente.de)} a ${conSigno(pendiente.a)}.`}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="ghost" onClick={() => setPendiente(null)}>No cambiar</Button>
              <Button onClick={() => { ejecutar(fijarReputacion(pendiente.id, pendiente.a, motivoReputacion)); setPendiente(null) }}>Cambiar</Button>
            </div>
          }
        >
          <Field
            label="Motivo"
            hint={pendiente.modo === 'oculta'
              ? 'Opcional; queda en tu registro, que solo ves tú.'
              : pendiente.modo === 'anonima'
                ? `Opcional; los jugadores lo verán en el registro de la banda, como «${ALGUIEN}».`
                : 'Opcional; los jugadores lo verán en el registro de la banda.'}
          >
            <Input value={motivoReputacion} onChange={(e) => setMotivoReputacion(e.target.value)} placeholder="Escoltaron a los refugiados" maxLength={120} autoFocus />
          </Field>
        </Sheet>
      )}
    </div>
  )
}

const fila = { padding: '10px 12px', borderRadius: radius.md, background: c.s1, border: `1px solid ${c.border}`, display: 'grid', gap: 8 } as const

const conIcono = { display: 'inline-flex', alignItems: 'center', gap: 5 } as const

const VISIBILIDAD: Record<ModoVisibilidad, { label: ReactNode }> = {
  oculta: { label: <span style={conIcono}><EyeOff size={14} aria-hidden />Oculta</span> },
  visible: { label: <span style={conIcono}><Eye size={14} aria-hidden />Visible</span> },
  anonima: { label: <span style={conIcono}><CircleHelp size={14} aria-hidden />Sin nombre</span> },
}

/** What the players see of a faction, under the director's controls */
function LoQueVen({ modo, nombre, valor }: { modo: ModoVisibilidad; nombre: string; valor: number }) {
  return (
    <p style={{ ...textoSuave, fontSize: fs.xs, display: 'flex', alignItems: 'center', gap: 6 }}>
      {modo === 'oculta' ? <EyeOff size={13} aria-hidden style={{ flexShrink: 0 }} /> : <Eye size={13} aria-hidden style={{ flexShrink: 0 }} />}
      <span>
        {modo === 'oculta'
          ? 'Los jugadores no la ven.'
          : `Los jugadores ven: ${modo === 'visible' ? nombre : ALGUIEN} · ${conSigno(valor)}`}
      </span>
    </p>
  )
}

/** A reputation the director showed, as a player sees it */
function FilaConocida({ f }: { f: ReputacionConocida }) {
  return (
    <li style={{ ...fila, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      {f.nombre ? (
        <span style={{ fontWeight: 600, color: c.text }}>{f.nombre}</span>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <CircleHelp size={18} aria-hidden style={{ flexShrink: 0, color: c.muted }} />
          <span>
            <span style={{ display: 'block', fontWeight: 600, color: c.text }}>{ALGUIEN}</span>
            <span style={{ display: 'block', fontSize: fs.xs, color: c.muted }}>No sabéis quién</span>
          </span>
        </span>
      )}
      <Badge tone={tonoReputacion(f.valor)}>{conSigno(f.valor)}</Badge>
    </li>
  )
}

function ContactoSheet({ contacto, secreto, facciones, patrocinador, era, onClose, aplicar }: {
  contacto: Contacto | null
  secreto: string
  facciones: { id: string; nombre: string; enemiga: boolean }[]
  /** What a sponsor is, shown when the contact is one */
  patrocinador: Definicion
  era: Era | null
  onClose: () => void
  aplicar: (op: OpBanda) => void
}) {
  const [datos, setDatos] = useState<DatosContacto>(() => contacto
    ? { ...contacto }
    : { nombre: '', faccion: null, relacion: 'neutral', papel: 'contacto', beneficio: '', notas: '' })
  const [textoSecreto, setTextoSecreto] = useState(secreto)
  const [idNuevo] = useState(nuevoId)
  const { error, ejecutar } = useEjecutar(aplicar)
  const set = (cambio: Partial<DatosContacto>) => setDatos((d) => ({ ...d, ...cambio }))

  const guardar = () => ejecutar(
    (doc, ctx) => {
      const tras = guardarContacto(datos, idNuevo)(doc, ctx)
      return textoSecreto !== secreto ? guardarSecreto(datos.id ?? idNuevo, textoSecreto)(tras, ctx) : tras
    },
    onClose,
  )

  return (
    <Sheet
      open
      onClose={onClose}
      title={contacto ? `Editar a ${contacto.nombre}` : 'Nuevo contacto'}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar} disabled={!datos.nombre.trim()}>Guardar</Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <Field label="Nombre">
          <Input value={datos.nombre} onChange={(e) => set({ nombre: e.target.value })} placeholder="Pella" autoFocus maxLength={60} />
        </Field>
        <div>
          <p style={{ fontSize: fs.sm, fontWeight: 650, color: c.text, marginBottom: 6 }}>Relación</p>
          <Segmented<Relacion>
            size="sm"
            ariaLabel="Relación"
            value={datos.relacion}
            onChange={(relacion) => set({ relacion })}
            options={(Object.keys(RELACION) as Relacion[]).map((r) => ({ value: r, label: RELACION[r].label }))}
          />
        </div>
        <div>
          <p style={{ fontSize: fs.sm, fontWeight: 650, color: c.text, marginBottom: 6 }}>Papel</p>
          <Segmented<PapelContacto>
            size="sm"
            ariaLabel="Papel"
            value={datos.papel}
            onChange={(papel) => set({ papel })}
            options={(Object.keys(PAPEL) as PapelContacto[]).map((p) => ({ value: p, label: PAPEL[p] }))}
          />
        </div>
        {datos.papel === 'patrocinador' && (
          <TextoRegla texto={patrocinador.texto} casero={patrocinador.casero} origen={patrocinador.origen} cita={patrocinador.cita} era={era} />
        )}
        <Field label="Facción">
          <Select value={datos.faccion ?? ''} onChange={(e) => set({ faccion: e.target.value || null })}>
            <option value="">Ninguna</option>
            {facciones.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Qué ofrece" hint="Lo que da a la banda y, si es un patrocinador, lo que espera a cambio.">
          <Input value={datos.beneficio} onChange={(e) => set({ beneficio: e.target.value })} placeholder="Literas en su barcaza a cambio de encargos" maxLength={160} />
        </Field>
        <Field label="Notas">
          <Textarea value={datos.notas} onChange={(e) => set({ notas: e.target.value })} rows={3} />
        </Field>
        <Field label="Secreto (solo tú)" hint="Nunca llega a los jugadores.">
          <Textarea value={textoSecreto} onChange={(e) => setTextoSecreto(e.target.value)} rows={2} />
        </Field>
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}
